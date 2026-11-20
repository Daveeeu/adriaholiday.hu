#!/usr/bin/env bash
#
# Installs the VPS side of the adriaholiday monitoring (see docs/operations.md):
#
# - adriaholiday-health-check every 5 minutes: disk, containers and certificate into
#   /srv/backups/adriaholiday/health/status (read by server1 over the backup key),
#   and the watchdog that alerts over ntfy when server1's Uptime Kuma goes silent;
# - adriaholiday-image-scan on the 1st of every month: Trivy scan of the images.
#
#   NTFY_URL=https://ntfy.sh/<topic> bash deploy/production/monitor-host.sh
#
# NTFY_URL is stored in /etc/adriaholiday/monitor.env (mode 600); without it an
# existing file is kept. Safe to run again. Run after backup-host.sh.

set -euo pipefail

APP_NAME=adriaholiday
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
BACKUP_DIR=/srv/backups/${APP_NAME}
BACKUP_USER=adriabackup
CONFIG_DIR=/etc/${APP_NAME}

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[1;31m!! %s\033[0m\n' "$*" >&2; exit 1; }

sudo -n true 2>/dev/null || fail "$(id -un) needs passwordless sudo."
id "${BACKUP_USER}" >/dev/null 2>&1 || fail "Run backup-host.sh first (no ${BACKUP_USER} user)."
command -v jq >/dev/null || sudo apt-get install -y -qq jq

log "Scripts"
sudo install -m 750 "${SCRIPT_DIR}/health-check.sh" /usr/local/sbin/${APP_NAME}-health-check
sudo install -m 750 "${SCRIPT_DIR}/image-scan.sh" /usr/local/sbin/${APP_NAME}-image-scan

log "Status directory (readable by ${BACKUP_USER})"
sudo install -d -m 2750 -g "${BACKUP_USER}" "${BACKUP_DIR}/health"

log "Configuration"
sudo install -d -m 755 "${CONFIG_DIR}"
if [ -n "${NTFY_URL:-}" ]; then
    echo "NTFY_URL=${NTFY_URL}" | sudo tee "${CONFIG_DIR}/monitor.env" >/dev/null
elif ! sudo test -f "${CONFIG_DIR}/monitor.env"; then
    echo "NTFY_URL=" | sudo tee "${CONFIG_DIR}/monitor.env" >/dev/null
    printf '\033[1;33m!! NTFY_URL is empty: the server1 watchdog cannot alert.\033[0m\n' >&2
fi
sudo chmod 600 "${CONFIG_DIR}/monitor.env"

log "systemd units"
write_unit() { sudo tee "/etc/systemd/system/$1" >/dev/null; }

write_unit ${APP_NAME}-health-check.service <<EOF
[Unit]
Description=adriaholiday health status for server1 and the server1 watchdog
After=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/${APP_NAME}-health-check
EOF
write_unit ${APP_NAME}-health-check.timer <<'EOF'
[Unit]
Description=adriaholiday health status every 5 minutes

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF

write_unit ${APP_NAME}-image-scan.service <<EOF
[Unit]
Description=adriaholiday monthly Trivy image scan
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/${APP_NAME}-image-scan
Nice=10
IOSchedulingClass=idle
EOF
write_unit ${APP_NAME}-image-scan.timer <<'EOF'
[Unit]
Description=adriaholiday Trivy image scan on the 1st of every month

[Timer]
OnCalendar=*-*-01 03:30
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now ${APP_NAME}-health-check.timer ${APP_NAME}-image-scan.timer
sudo systemctl start ${APP_NAME}-health-check.service

log "Done"
sudo cat "${BACKUP_DIR}/health/status"
systemctl list-timers "${APP_NAME}-*" --no-pager
