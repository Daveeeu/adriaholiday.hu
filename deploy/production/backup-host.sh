#!/usr/bin/env bash
#
# The VPS side of the adriaholiday backup (see docs/production-server.md):
#
# - an hourly consistent MariaDB dump into /srv/backups/adriaholiday/db (the last 48 kept);
# - a read-only bind mount of the uploaded media at /srv/backups/adriaholiday/media;
# - an "adriabackup" user that may only read /srv/backups/adriaholiday over rsync, with
#   the key given in BACKUP_PULL_KEY (the off-site server pulls; nothing here can
#   reach or delete the off-site copies).
#
#   BACKUP_PULL_KEY="ssh-ed25519 AAAA... server1" bash deploy/production/backup-host.sh
#
# Safe to run again. Run after bootstrap.sh (the database container must exist).

set -euo pipefail

APP_NAME=adriaholiday
BACKUP_DIR=/srv/backups/${APP_NAME}
MEDIA_VOLUME=/var/lib/docker/volumes/${APP_NAME}_laravel-storage/_data/app
# Not "backup": Ubuntu ships a system user of that name (home /var/backups, nologin).
BACKUP_USER=adriabackup
ADMIN_USER=$(id -un)

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[1;31m!! %s\033[0m\n' "$*" >&2; exit 1; }

[ -n "${BACKUP_PULL_KEY:-}" ] || fail "Set BACKUP_PULL_KEY to the off-site server's public key."
sudo -n true 2>/dev/null || fail "${ADMIN_USER} needs passwordless sudo."
sudo test -d "${MEDIA_VOLUME}" || fail "Media volume not found: ${MEDIA_VOLUME} (run bootstrap.sh first)."

log "Backup user (rsync read-only, key only)"
id "${BACKUP_USER}" >/dev/null 2>&1 || sudo useradd --system --create-home --shell /bin/sh "${BACKUP_USER}"

log "Directories (group ${BACKUP_USER}; new dumps inherit it)"
sudo mkdir -p "${BACKUP_DIR}/db" "${BACKUP_DIR}/media"
sudo chgrp "${BACKUP_USER}" /srv/backups "${BACKUP_DIR}" "${BACKUP_DIR}/db"
sudo chmod 750 /srv/backups "${BACKUP_DIR}"
sudo chmod 2750 "${BACKUP_DIR}/db"

log "Hourly database dump"
sudo tee /usr/local/sbin/${APP_NAME}-db-dump >/dev/null <<EOF
#!/usr/bin/env bash
# Written by deploy/production/backup-host.sh.
set -euo pipefail
target=${BACKUP_DIR}/db/${APP_NAME}-\$(date +%Y%m%d-%H%M).sql.gz
docker exec ${APP_NAME}-db-1 sh -c 'mariadb-dump --single-transaction --routines --triggers --events -u root -p"\$MARIADB_ROOT_PASSWORD" ${APP_NAME}' \\
    | gzip -6 --rsyncable >"\${target}.part"
mv "\${target}.part" "\${target}"
chmod 640 "\${target}"
ls -1t ${BACKUP_DIR}/db/${APP_NAME}-*.sql.gz | tail -n +49 | xargs -r rm -f
EOF
sudo chmod 750 /usr/local/sbin/${APP_NAME}-db-dump

sudo tee /etc/systemd/system/${APP_NAME}-db-dump.service >/dev/null <<EOF
[Unit]
Description=adriaholiday MariaDB dump into ${BACKUP_DIR}/db
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/${APP_NAME}-db-dump
Nice=10
IOSchedulingClass=idle
EOF
sudo tee /etc/systemd/system/${APP_NAME}-db-dump.timer >/dev/null <<'EOF'
[Unit]
Description=Hourly adriaholiday MariaDB dump

[Timer]
OnCalendar=*-*-* *:05
Persistent=true

[Install]
WantedBy=timers.target
EOF

log "Read-only media mount"
MOUNT_UNIT=$(systemd-escape --path --suffix=mount "${BACKUP_DIR}/media")
sudo tee "/etc/systemd/system/${MOUNT_UNIT}" >/dev/null <<EOF
[Unit]
Description=Read-only view of the adriaholiday media for the backup pull
After=docker.service

[Mount]
What=${MEDIA_VOLUME}
Where=${BACKUP_DIR}/media
Type=none
Options=bind,ro

[Install]
WantedBy=multi-user.target
EOF

log "Backup user's key"
sudo install -d -m 700 -o "${BACKUP_USER}" -g "${BACKUP_USER}" "/home/${BACKUP_USER}/.ssh"
echo "restrict,command=\"/usr/bin/rrsync -ro ${BACKUP_DIR}\" ${BACKUP_PULL_KEY}" \
    | sudo tee "/home/${BACKUP_USER}/.ssh/authorized_keys" >/dev/null
sudo chown "${BACKUP_USER}:${BACKUP_USER}" "/home/${BACKUP_USER}/.ssh/authorized_keys"
sudo chmod 600 "/home/${BACKUP_USER}/.ssh/authorized_keys"

if ! sudo grep -qE "^AllowUsers .*\b${BACKUP_USER}\b" /etc/ssh/sshd_config.d/01-hardening.conf; then
    sudo sed -i "s/^AllowUsers .*/& ${BACKUP_USER}/" /etc/ssh/sshd_config.d/01-hardening.conf
fi
sudo sshd -t
sudo systemctl reload ssh

sudo systemctl daemon-reload
sudo systemctl enable --now "${MOUNT_UNIT}" ${APP_NAME}-db-dump.timer
sudo systemctl start ${APP_NAME}-db-dump.service

log "Done"
sudo ls -lh "${BACKUP_DIR}/db" | tail -3
systemctl list-timers ${APP_NAME}-db-dump.timer --no-pager | head -2
