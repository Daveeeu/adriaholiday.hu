#!/usr/bin/env bash
#
# Deploys one release of adriaholiday to the VPS (see docs/release-pipeline.md).
# Installed by deploy/production/deploy-host.sh as /usr/local/sbin/adriaholiday-deploy
# and run as root, either by the release workflow over the restricted deploy key
# or by hand:
#
#   sudo adriaholiday-deploy v1.4.0
#
# 1. Takes a database dump (the hourly dump job, run now).
# 2. Checks out the tag in /srv/apps/adriaholiday, so compose files and config
#    match the images.
# 3. Pulls the images built for the tag from GHCR and restarts the stack with
#    them (the entrypoint runs the migrations).
# 4. Waits until app and nginx are healthy and /health answers "ok". Otherwise it
#    goes back to the previous release and exits non-zero. Migrations are not
#    rolled back: restore the dump from step 1 if a release changed the schema.

set -euo pipefail

APP_NAME=adriaholiday
APP_DIR=/srv/apps/${APP_NAME}
STATE_DIR=/var/lib/${APP_NAME}-deploy
IMAGE_REPOSITORY=${IMAGE_REPOSITORY:-ghcr.io/daveeeu/adriaholiday}
HEALTH_TIMEOUT_SECONDS=${HEALTH_TIMEOUT_SECONDS:-300}

log() { printf '==> %s\n' "$*"; }
fail() { printf '!! %s\n' "$*" >&2; exit 1; }

tag=${1:-}
[[ "${tag}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail "Usage: adriaholiday-deploy vMAJOR.MINOR.PATCH"
[ "$(id -u)" -eq 0 ] || fail "Run as root."

mkdir -p "${STATE_DIR}"
exec 9>"${STATE_DIR}/.lock"
flock -n 9 || fail "Another deploy is running."

cd "${APP_DIR}"
DATABASE_STACK=$(sed -n 's/^DATABASE_STACK=//p' .env.production)
[ -n "${DATABASE_STACK}" ] || fail "DATABASE_STACK missing from .env.production."

# The checkout and .env.production belong to the admin user: git and sed run as
# that user, so ownership never changes and git does not refuse a foreign repo.
owner=$(stat -c %U "${APP_DIR}")
as_owner() { sudo -u "${owner}" "$@"; }

compose() {
    docker compose --project-name "${APP_NAME}" --env-file .env.production \
        -f docker-compose.prod.yml -f deploy/production/compose.server.yml \
        -f "deploy/production/compose.${DATABASE_STACK}.yml" "$@"
}

set_env() {
    if grep -q "^$1=" .env.production; then
        as_owner sed -i "s|^$1=.*|$1=$2|" .env.production
    else
        echo "$1=$2" | as_owner tee -a .env.production >/dev/null
    fi
}

container_health() {
    docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$1" 2>/dev/null || echo missing
}

wait_healthy() {
    local deadline=$(( $(date +%s) + HEALTH_TIMEOUT_SECONDS )) app nginx
    while [ "$(date +%s)" -lt "${deadline}" ]; do
        app=$(container_health "${APP_NAME}-app-1")
        nginx=$(container_health "${APP_NAME}-nginx-1")
        if [ "${app}" = healthy ] && [ "${nginx}" = healthy ] \
            && docker exec "${APP_NAME}-nginx-1" wget -qO- http://127.0.0.1/health 2>/dev/null | grep -q '"status":"ok"'; then
            return 0
        fi
        sleep 5
    done
    echo "app: ${app}, nginx: ${nginx}" >&2
    return 1
}

# The images are pulled before anything changes: a tag whose images cannot be
# pulled (not built, or a private package) leaves the running release untouched.
activate() {
    docker pull --quiet "${IMAGE_REPOSITORY}/app:$1" >/dev/null
    docker pull --quiet "${IMAGE_REPOSITORY}/nginx:$1" >/dev/null
    as_owner git fetch --quiet --force --tags origin
    as_owner git checkout --quiet --force "refs/tags/$1"
    set_env APP_IMAGE_REPOSITORY "${IMAGE_REPOSITORY}"
    set_env APP_IMAGE_TAG "$1"
    compose up -d --no-build --remove-orphans
}

previous=$(cat "${STATE_DIR}/current" 2>/dev/null || true)
log "Deploying ${tag} (previous: ${previous:-none})"

log "Database dump"
systemctl start "${APP_NAME}-db-dump.service"

log "Images and restart"
activate "${tag}"

log "Waiting for health (up to ${HEALTH_TIMEOUT_SECONDS}s)"
if wait_healthy; then
    echo "${tag}" >"${STATE_DIR}/current"
    echo "$(date -Is) ${tag} ok" >>"${STATE_DIR}/history"
    docker image prune --force --filter "until=168h" >/dev/null
    log "${tag} is live"
    exit 0
fi

echo "$(date -Is) ${tag} failed" >>"${STATE_DIR}/history"
compose logs --tail 50 app nginx >&2 || true
if [ -n "${previous}" ]; then
    log "Unhealthy: rolling back to ${previous}"
    activate "${previous}"
    if wait_healthy; then
        log "${previous} is live again"
    else
        log "The rollback is not healthy either: check by hand"
    fi
fi
fail "${tag} failed its health check."
