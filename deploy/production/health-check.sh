#!/usr/bin/env bash
#
# The VPS side of the adriaholiday resource monitoring (see docs/operations.md).
# Installed by deploy/production/monitor-host.sh as /usr/local/sbin/adriaholiday-health-check
# and run as root every 5 minutes by a systemd timer.
#
# 1. Writes the host's state into ${STATUS_FILE}, where server1 reads it over the
#    read-only backup key (deploy/monitoring/vps-health-pull.sh) and turns it into
#    Uptime Kuma push heartbeats. Nothing here can reach server1.
# 2. Watches server1 in return: Uptime Kuma requests this site every minute, so
#    when nginx has seen none for WATCHDOG_MINUTES, server1 (or its Kuma) is down and
#    nothing else would say so. It then notifies NTFY_URL directly, once per change.
#
# Configuration: /etc/adriaholiday/monitor.env (NTFY_URL, optional overrides below).

set -euo pipefail

APP_NAME=adriaholiday
CONFIG=/etc/${APP_NAME}/monitor.env
# shellcheck source=/dev/null
[ -r "${CONFIG}" ] && . "${CONFIG}"

STATUS_FILE=${STATUS_FILE:-/srv/backups/${APP_NAME}/health/status}
STATE_DIR=${STATE_DIR:-/var/lib/${APP_NAME}-monitor}
DISK_LIMIT_PERCENT=${DISK_LIMIT_PERCENT:-85}
CERT_MIN_DAYS=${CERT_MIN_DAYS:-14}
PUBLIC_HOST=${PUBLIC_HOST:-adriaholiday.hu}
REQUIRED_CONTAINERS=${REQUIRED_CONTAINERS:-app nginx db redis}
WATCHDOG_MINUTES=${WATCHDOG_MINUTES:-15}
NTFY_URL=${NTFY_URL:-}

mkdir -p "${STATE_DIR}"

disk_status() {
    disk_percent=$(df --output=pcent / | tail -1 | tr -dc '0-9')
    disk_ok=$(( disk_percent < DISK_LIMIT_PERCENT ? 1 : 0 ))
}

# Every adriaholiday-* container must be running and not unhealthy, and the
# required services must exist. One-off "compose run" containers are ignored.
container_status() {
    local name state status service problems=()
    local listing
    listing=$(docker ps -a --filter "name=^${APP_NAME}-" --format '{{.Names}}|{{.State}}|{{.Status}}' | grep -v -- '-run-' || true)

    for service in ${REQUIRED_CONTAINERS}; do
        grep -q "^${APP_NAME}-${service}-[0-9]*|" <<<"${listing}" || problems+=("${service}: missing")
    done

    while IFS='|' read -r name state status; do
        [ -n "${name}" ] || continue
        service=${name#"${APP_NAME}-"}
        service=${service%-[0-9]*}
        if [ "${state}" != running ]; then
            problems+=("${service}: ${state}")
        elif [[ "${status}" == *"(unhealthy)"* ]]; then
            problems+=("${service}: unhealthy")
        fi
    done <<<"${listing}"

    if [ ${#problems[@]} -eq 0 ]; then
        containers_ok=1
        containers_detail="$(wc -l <<<"${listing}" | tr -d ' ') running"
    else
        containers_ok=0
        containers_detail=$(IFS=,; echo "${problems[*]}")
    fi
}

# The certificate Traefik serves here, whatever public DNS currently points to.
cert_status() {
    local end
    end=$(openssl s_client -connect 127.0.0.1:443 -servername "${PUBLIC_HOST}" </dev/null 2>/dev/null \
        | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2) || true
    if [ -n "${end}" ]; then
        cert_days=$(( ($(date -d "${end}" +%s) - $(date +%s)) / 86400 ))
    else
        cert_days=-1
    fi
    cert_ok=$(( cert_days >= CERT_MIN_DAYS ? 1 : 0 ))
}

write_status() {
    local tmp
    tmp=$(mktemp "${STATUS_FILE}.XXXXXX")
    cat >"${tmp}" <<EOF
checked_at=$(date +%s)
disk_percent=${disk_percent}
disk_ok=${disk_ok}
containers_ok=${containers_ok}
containers_detail=${containers_detail}
cert_days=${cert_days}
cert_ok=${cert_ok}
EOF
    chmod 640 "${tmp}"
    mv "${tmp}" "${STATUS_FILE}"
}

notify() {
    [ -n "${NTFY_URL}" ] || return 0
    curl -fsS -m 15 --retry 3 -H "Title: $1" -H "Priority: $2" -H "Tags: $3" -d "$4" "${NTFY_URL}" >/dev/null \
        || echo "ntfy notification failed" >&2
}

watch_server1() {
    local seen previous
    seen=$(docker logs --since "${WATCHDOG_MINUTES}m" "${APP_NAME}-nginx-1" 2>&1 | grep -c 'Uptime-Kuma' || true)
    previous=$(cat "${STATE_DIR}/server1" 2>/dev/null || echo up)

    if [ "${seen}" -eq 0 ] && [ "${previous}" = up ]; then
        notify "server1 monitoring csendes" urgent warning \
            "${WATCHDOG_MINUTES} perce nem jött Uptime Kuma kérés a VPS-re. A server1 vagy az Uptime Kuma nem fut, így a többi riasztás sem működik."
        echo down >"${STATE_DIR}/server1"
    elif [ "${seen}" -gt 0 ] && [ "${previous}" = down ]; then
        notify "server1 monitoring újra fut" default white_check_mark "Az Uptime Kuma ismét figyeli az oldalt."
        echo up >"${STATE_DIR}/server1"
    fi
}

disk_status
container_status
cert_status
write_status
watch_server1
