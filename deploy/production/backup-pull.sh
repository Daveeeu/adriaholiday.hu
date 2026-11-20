#!/usr/bin/env bash
#
# The off-site side of the adriaholiday backup (see docs/production-server.md).
# Runs on server1 from cron as an unprivileged user: pulls the VPS's
# /srv/backups/adriaholiday (hourly database dumps and the uploaded media) over
# a read-only rsync key, then stores it in a local restic repository. The VPS
# cannot reach this server, so a compromised VPS cannot delete the history.
#
#   20 * * * *  $HOME/bin/adriaholiday-backup-pull
#
# Optional environment: VPS (default adriabackup@217.144.53.32), KEY, BASE,
# RESTIC_REPOSITORY, RESTIC_PASSWORD_FILE, and BACKUP_PING_URL: an Uptime Kuma
# push URL that gets status=up after every successful run and status=down when a
# run fails, so a silent or failing backup alerts (docs/operations.md). The
# variables can also live in ~/.config/adriaholiday/monitoring.env.

set -euo pipefail

CONFIG=${CONFIG:-$HOME/.config/adriaholiday/monitoring.env}
# shellcheck source=/dev/null
[ -r "${CONFIG}" ] && . "${CONFIG}"

VPS=${VPS:-adriabackup@217.144.53.32}
KEY=${KEY:-$HOME/.ssh/adriaholiday_backup}
BASE=${BASE:-$HOME/backups/adriaholiday}
MIRROR=${BASE}/mirror
export RESTIC_REPOSITORY=${RESTIC_REPOSITORY:-${BASE}/restic}
export RESTIC_PASSWORD_FILE=${RESTIC_PASSWORD_FILE:-$HOME/.config/restic/adriaholiday.pass}

BACKUP_PING_URL=${BACKUP_PING_URL:-}

ping_monitor() {
    [ -n "${BACKUP_PING_URL}" ] || return 0
    curl -fsS -m 10 --retry 3 -G "${BACKUP_PING_URL}" \
        --data-urlencode "status=$1" --data-urlencode "msg=$2" >/dev/null || echo "Backup ping failed." >&2
}
trap 'ping_monitor down "backup pull failed at line ${LINENO}"' ERR

mkdir -p "${MIRROR}"

# One run at a time: a slow media sync must not overlap the next hour's run.
exec 9>"${BASE}/.lock"
flock -n 9 || { echo "Previous run still in progress." >&2; exit 0; }

[ -d "${RESTIC_REPOSITORY}" ] || restic init --quiet

# health/ is the VPS's monitoring status (deploy/production/health-check.sh), not backup data.
# Exit codes 23/24 mean some files could not be read or vanished: the rest, above
# all the database dumps, is still stored, and the run is reported as failed.
rsync_status=0
rsync -a --delete --partial --exclude=/health/ -e "ssh -i ${KEY} -o BatchMode=yes -o StrictHostKeyChecking=accept-new" \
    "${VPS}:./" "${MIRROR}/" || rsync_status=$?
case ${rsync_status} in
    0 | 23 | 24) ;;
    *) ping_monitor down "rsync failed (exit ${rsync_status})"; exit "${rsync_status}" ;;
esac

restic backup --quiet --tag adriaholiday --host adriaholiday-prod "${MIRROR}"

# Once a day: thin out the history and verify the repository.
if [ "$(date +%H)" = 03 ]; then
    restic forget --quiet --prune --tag adriaholiday \
        --keep-hourly 48 --keep-daily 30 --keep-weekly 12 --keep-monthly 12
    restic check --quiet
fi

if [ "${rsync_status}" -ne 0 ]; then
    ping_monitor down "partial backup: rsync exit ${rsync_status}, see pull.log"
    exit "${rsync_status}"
fi

date -Is >"${BASE}/last-success"
ping_monitor up "backup stored $(date +%H:%M)"
