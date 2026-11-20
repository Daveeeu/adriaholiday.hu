#!/usr/bin/env bash
#
# server1 side of the VPS resource monitoring (see docs/operations.md). Runs from
# cron every 5 minutes as an unprivileged user:
#
#   */5 * * * *  $HOME/bin/adriaholiday-vps-health-pull
#
# Reads the status file the VPS writes (deploy/production/health-check.sh) over
# the read-only backup key and reports each check to its Uptime Kuma push monitor:
# up when healthy, down with the reason otherwise. When the VPS cannot be reached
# or the file is stale, it pushes nothing and Kuma alerts after the monitor's
# interval.
#
# Configuration: ~/.config/adriaholiday/monitoring.env with KUMA_PUSH_BASE,
# DISK_PUSH_TOKEN, CONTAINERS_PUSH_TOKEN, CERT_PUSH_TOKEN; optional VPS, KEY.

set -euo pipefail

CONFIG=${CONFIG:-$HOME/.config/adriaholiday/monitoring.env}
# shellcheck source=/dev/null
[ -r "${CONFIG}" ] && . "${CONFIG}"

VPS=${VPS:-adriabackup@217.144.53.32}
KEY=${KEY:-$HOME/.ssh/adriaholiday_backup}
KUMA_PUSH_BASE=${KUMA_PUSH_BASE:-http://127.0.0.1:3012/api/push}
MAX_AGE_SECONDS=${MAX_AGE_SECONDS:-900}
: "${DISK_PUSH_TOKEN:?missing}" "${CONTAINERS_PUSH_TOKEN:?missing}" "${CERT_PUSH_TOKEN:?missing}"

status=$(mktemp)
trap 'rm -f "${status}"' EXIT

rsync -q -e "ssh -i ${KEY} -o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new" \
    "${VPS}:health/status" "${status}"

value() { sed -n "s/^$1=//p" "${status}"; }

push() {
    local token=$1 ok=$2 msg=$3 state=up
    [ "${ok}" = 1 ] || state=down
    curl -fsS -m 10 -G "${KUMA_PUSH_BASE}/${token}" \
        --data-urlencode "status=${state}" --data-urlencode "msg=${msg}" >/dev/null
}

age=$(( $(date +%s) - $(value checked_at) ))
if [ "${age}" -gt "${MAX_AGE_SECONDS}" ]; then
    echo "VPS status is ${age}s old; the health-check timer is not running." >&2
    exit 1
fi

push "${DISK_PUSH_TOKEN}" "$(value disk_ok)" "/ $(value disk_percent)% used"
push "${CONTAINERS_PUSH_TOKEN}" "$(value containers_ok)" "$(value containers_detail)"
push "${CERT_PUSH_TOKEN}" "$(value cert_ok)" "certificate valid for $(value cert_days) more days"
