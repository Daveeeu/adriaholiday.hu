#!/usr/bin/env bash
#
# The off-site side of the adriaholiday backup (see docs/production-server.md).
# Runs on server1 from cron as an unprivileged user: pulls the VPS's
# /srv/backups/adriaholiday (hourly database dumps and the uploaded media) over
# a read-only rsync key, then stores it in a local restic repository. The VPS
# cannot reach this server, so a compromised VPS cannot delete the history.
#
#   5 * * * *  $HOME/bin/adriaholiday-backup-pull
#
# Optional environment: VPS (default adriabackup@217.144.53.32), KEY, BASE,
# RESTIC_REPOSITORY, RESTIC_PASSWORD_FILE.

set -euo pipefail

VPS=${VPS:-adriabackup@217.144.53.32}
KEY=${KEY:-$HOME/.ssh/adriaholiday_backup}
BASE=${BASE:-$HOME/backups/adriaholiday}
MIRROR=${BASE}/mirror
export RESTIC_REPOSITORY=${RESTIC_REPOSITORY:-${BASE}/restic}
export RESTIC_PASSWORD_FILE=${RESTIC_PASSWORD_FILE:-$HOME/.config/restic/adriaholiday.pass}

mkdir -p "${MIRROR}"

# One run at a time: a slow media sync must not overlap the next hour's run.
exec 9>"${BASE}/.lock"
flock -n 9 || { echo "Previous run still in progress." >&2; exit 0; }

[ -d "${RESTIC_REPOSITORY}" ] || restic init --quiet

rsync -a --delete --partial -e "ssh -i ${KEY} -o BatchMode=yes -o StrictHostKeyChecking=accept-new" \
    "${VPS}:./" "${MIRROR}/"

restic backup --quiet --tag adriaholiday --host adriaholiday-prod "${MIRROR}"

# Once a day: thin out the history and verify the repository.
if [ "$(date +%H)" = 03 ]; then
    restic forget --quiet --prune --tag adriaholiday \
        --keep-hourly 48 --keep-daily 30 --keep-weekly 12 --keep-monthly 12
    restic check --quiet
fi

date -Is >"${BASE}/last-success"
