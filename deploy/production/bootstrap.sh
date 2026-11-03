#!/usr/bin/env bash
#
# First install (and later redeploys) of adriaholiday.hu on the shared Docker
# host (Traefik + platform Postgres, see docs/production-server.md):
#
#   curl -fsSL https://raw.githubusercontent.com/Daveeeu/adriaholiday.hu/main/deploy/production/bootstrap.sh -o bootstrap.sh
#   bash bootstrap.sh [--import /path/to/adriaholiday_export_v2.json]
#
# It is safe to run again: secrets and the database are created once, the code
# is updated to the latest main, the images are rebuilt and the stack restarted.
#
# Optional environment: ADMIN_EMAIL (first admin, default adriaholiday@adriaholiday.hu),
# MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_SCHEME (real SMTP;
# without them mail goes to the platform Mailpit), BRANCH (default main),
# DATABASE_STACK (platform-postgres or mariadb; an install that already runs the
# stack's own MariaDB keeps it, a new install uses the platform Postgres).

set -euo pipefail

APP_NAME=adriaholiday
APP_DIR=/srv/apps/${APP_NAME}
DATA_DIR=/srv/data/${APP_NAME}
REPO_URL=https://github.com/Daveeeu/adriaholiday.hu.git
BRANCH=${BRANCH:-main}
TRAEFIK_DYNAMIC_DIR=/srv/apps/traefik/dynamic
POSTGRES_CONTAINER=${POSTGRES_CONTAINER:-platform-postgres-1}
ADMIN_EMAIL=${ADMIN_EMAIL:-adriaholiday@adriaholiday.hu}
IMPORT_FILE=""

while [ $# -gt 0 ]; do
    case "$1" in
        --import) IMPORT_FILE=$(realpath "$2"); shift 2 ;;
        *) echo "Unknown option: $1" >&2; exit 1 ;;
    esac
done

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[1;31m!! %s\033[0m\n' "$*" >&2; exit 1; }

# Runs a command as root only where the deploy user may not write (e.g. /srv/apps/traefik).
sudo_if_needed() { if [ -w "$1" ] || { [ ! -e "$1" ] && [ -w "$(dirname "$1")" ]; }; then "${@:2}"; else sudo "${@:2}"; fi; }

secret() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c "${1:-40}"; }

# The user-defined networks of a container, one per line.
networks_of() { docker inspect -f '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}' "$1" | grep -vxE 'bridge|host|none|' || true; }

compose() {
    docker compose --project-name "${APP_NAME}" --env-file .env.production \
        -f docker-compose.prod.yml -f deploy/production/compose.server.yml \
        -f "deploy/production/compose.${DATABASE_STACK}.yml" "$@"
}

env_value() { grep "^$2=" "$1" 2>/dev/null | cut -d= -f2- || true; }

command -v docker >/dev/null || fail "docker is missing."
command -v git >/dev/null || fail "git is missing."
command -v openssl >/dev/null || fail "openssl is missing."
docker info >/dev/null 2>&1 || fail "This user cannot use Docker (add it to the docker group or run with sudo)."

log "Code: ${REPO_URL} (${BRANCH}) → ${APP_DIR}"
sudo_if_needed /srv/apps mkdir -p "${APP_DIR}" "${DATA_DIR}"
sudo_if_needed /srv/apps chown "$(id -u):$(id -g)" "${APP_DIR}" "${DATA_DIR}"

if [ -d "${APP_DIR}/.git" ]; then
    git -C "${APP_DIR}" fetch --quiet origin "${BRANCH}"
    git -C "${APP_DIR}" checkout --quiet "${BRANCH}"
    git -C "${APP_DIR}" reset --quiet --hard "origin/${BRANCH}"
else
    git clone --quiet --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}.tmp"
    cp -a "${APP_DIR}.tmp/." "${APP_DIR}/"
    rm -rf "${APP_DIR}.tmp"
fi

cd "${APP_DIR}"

# An install that already runs the stack's own MariaDB (DB_HOST=db) keeps it, so its data stays where it is.
DATABASE_STACK=${DATABASE_STACK:-$(env_value .env.production DATABASE_STACK)}
if [ -z "${DATABASE_STACK}" ]; then
    if [ "$(env_value .env.production DB_HOST)" = db ]; then DATABASE_STACK=mariadb; else DATABASE_STACK=platform-postgres; fi
fi
case "${DATABASE_STACK}" in
    platform-postgres | mariadb) ;;
    *) fail "Unknown DATABASE_STACK: ${DATABASE_STACK} (platform-postgres or mariadb)." ;;
esac

log "Platform: Traefik network"
TRAEFIK_CONTAINER=$(docker ps --format '{{.Names}}' | grep -m1 -i traefik || true)
[ -n "${TRAEFIK_CONTAINER}" ] || fail "No running Traefik container found."
EDGE_NETWORK=$(networks_of "${TRAEFIK_CONTAINER}" | head -1)
[ -n "${EDGE_NETWORK}" ] || fail "Could not find the Traefik network."
echo "Traefik: ${TRAEFIK_CONTAINER} on ${EDGE_NETWORK}"

DB_PASSWORD=$(env_value .env.production DB_PASSWORD)
DB_PASSWORD=${DB_PASSWORD:-$(secret 32)}

if [ "${DATABASE_STACK}" = platform-postgres ]; then
    log "Database: platform Postgres role and database ${APP_NAME}"
    docker inspect "${POSTGRES_CONTAINER}" >/dev/null 2>&1 || fail "Postgres container ${POSTGRES_CONTAINER} not found (set POSTGRES_CONTAINER)."
    # A Postgres network Traefik is not on keeps the database off the edge network, when there is one.
    DATABASE_NETWORK=$(networks_of "${POSTGRES_CONTAINER}" | grep -vxF "${EDGE_NETWORK}" | head -1 || true)
    DATABASE_NETWORK=${DATABASE_NETWORK:-$(networks_of "${POSTGRES_CONTAINER}" | head -1)}
    [ -n "${DATABASE_NETWORK}" ] || fail "Could not find the Postgres network."
    echo "Postgres: ${POSTGRES_CONTAINER} on ${DATABASE_NETWORK}"

    PG_SUPERUSER=$(docker exec "${POSTGRES_CONTAINER}" printenv POSTGRES_USER 2>/dev/null || echo postgres)
    psql_admin() { docker exec -i "${POSTGRES_CONTAINER}" psql -v ON_ERROR_STOP=1 -U "${PG_SUPERUSER}" -d postgres -tAc "$1"; }

    if [ "$(psql_admin "SELECT 1 FROM pg_roles WHERE rolname = '${APP_NAME}'")" != "1" ]; then
        psql_admin "CREATE ROLE ${APP_NAME} LOGIN PASSWORD '${DB_PASSWORD}'"
    else
        psql_admin "ALTER ROLE ${APP_NAME} LOGIN PASSWORD '${DB_PASSWORD}'"
    fi

    if [ "$(psql_admin "SELECT 1 FROM pg_database WHERE datname = '${APP_NAME}'")" != "1" ]; then
        psql_admin "CREATE DATABASE ${APP_NAME} OWNER ${APP_NAME}"
    fi

    DB_CONNECTION=pgsql
    DB_HOST=${POSTGRES_CONTAINER}
    DB_PORT=5432
    DB_DATABASE=${APP_NAME}
    DB_USERNAME=${APP_NAME}
else
    log "Database: the stack's own MariaDB (deploy/production/compose.mariadb.yml)"
    DB_CONNECTION=mysql
    DB_HOST=db
    DB_PORT=3306
    DB_DATABASE=$(env_value .env.production DB_DATABASE)
    DB_DATABASE=${DB_DATABASE:-${APP_NAME}}
    DB_USERNAME=$(env_value .env.production DB_USERNAME)
    DB_USERNAME=${DB_USERNAME:-${APP_NAME}}
fi

log "Environment files"
if [ ! -f .env.production ]; then
    cp .env.production.example .env.production
    chmod 600 .env.production
fi

# sed -i replaces the file through its directory, so it also works on a file the deploy group may only read.
set_env() {
    local file=$1 key=$2 value=$3
    if ! grep -q "^${key}=" "${file}"; then
        sed -i "\$a ${key}=${value}" "${file}"
    elif [ "$(env_value "${file}" "${key}")" != "${value}" ]; then
        sed -i "s|^${key}=.*|${key}=${value}|" "${file}"
    fi
}

set_env .env.production DATABASE_STACK "${DATABASE_STACK}"
set_env .env.production EDGE_NETWORK_NAME "${EDGE_NETWORK}"
if [ "${DATABASE_STACK}" = platform-postgres ]; then
    set_env .env.production DATABASE_NETWORK_NAME "${DATABASE_NETWORK}"
else
    grep -q '^DB_ROOT_PASSWORD=.\+' .env.production || set_env .env.production DB_ROOT_PASSWORD "$(secret 32)"
fi
set_env .env.production DB_HOST "${DB_HOST}"
set_env .env.production DB_PORT "${DB_PORT}"
set_env .env.production DB_DATABASE "${DB_DATABASE}"
set_env .env.production DB_USERNAME "${DB_USERNAME}"
set_env .env.production DB_PASSWORD "${DB_PASSWORD}"
set_env .env.production LARAVEL_ENV_FILE ./backend/.env.production
grep -q '^REDIS_PASSWORD=.\+' .env.production || set_env .env.production REDIS_PASSWORD "$(secret 32)"
REDIS_PASSWORD=$(grep '^REDIS_PASSWORD=' .env.production | cut -d= -f2-)

LARAVEL_ENV=backend/.env.production
if [ ! -f "${LARAVEL_ENV}" ]; then
    cp backend/.env.production.example "${LARAVEL_ENV}"
    chmod 600 "${LARAVEL_ENV}"
    set_env "${LARAVEL_ENV}" APP_KEY "base64:$(openssl rand -base64 32)"
    set_env "${LARAVEL_ENV}" ADMIN_SEED_EMAIL "${ADMIN_EMAIL}"
    set_env "${LARAVEL_ENV}" ADMIN_SEED_PASSWORD "$(secret 20)"
fi

set_env "${LARAVEL_ENV}" DB_CONNECTION "${DB_CONNECTION}"
set_env "${LARAVEL_ENV}" DB_HOST "${DB_HOST}"
set_env "${LARAVEL_ENV}" DB_PORT "${DB_PORT}"
set_env "${LARAVEL_ENV}" DB_DATABASE "${DB_DATABASE}"
set_env "${LARAVEL_ENV}" DB_USERNAME "${DB_USERNAME}"
set_env "${LARAVEL_ENV}" DB_PASSWORD "${DB_PASSWORD}"
set_env "${LARAVEL_ENV}" REDIS_PASSWORD "${REDIS_PASSWORD}"

if [ -n "${MAIL_HOST:-}" ]; then
    set_env "${LARAVEL_ENV}" MAIL_HOST "${MAIL_HOST}"
    set_env "${LARAVEL_ENV}" MAIL_PORT "${MAIL_PORT:-587}"
    set_env "${LARAVEL_ENV}" MAIL_SCHEME "${MAIL_SCHEME:-tls}"
    set_env "${LARAVEL_ENV}" MAIL_USERNAME "${MAIL_USERNAME:-}"
    set_env "${LARAVEL_ENV}" MAIL_PASSWORD "${MAIL_PASSWORD:-}"
elif grep -q '^MAIL_HOST=smtp.example.com' "${LARAVEL_ENV}"; then
    # Other apps run their own Mailpit; the platform one is shared.
    MAILPIT_CONTAINER=$(docker ps --format '{{.Names}}' | grep -m1 -x 'platform-mailpit-1' || true)
    if [ -n "${MAILPIT_CONTAINER}" ]; then
        set_env "${LARAVEL_ENV}" MAIL_HOST "${MAILPIT_CONTAINER}"
        set_env "${LARAVEL_ENV}" MAIL_PORT 1025
        set_env "${LARAVEL_ENV}" MAIL_SCHEME smtp
        echo "No SMTP given: mail goes to Mailpit (https://mail.jandldavid.hu) until MAIL_* is set in ${APP_DIR}/${LARAVEL_ENV}."
    fi
fi

log "Build (a few minutes on the first run)"
compose build

log "Start"
compose up -d --remove-orphans

log "Waiting for the app to be healthy"
for _ in $(seq 1 60); do
    status=$(docker inspect -f '{{.State.Health.Status}}' "${APP_NAME}-app-1" 2>/dev/null || echo starting)
    [ "${status}" = healthy ] && break
    sleep 5
done
[ "${status}" = healthy ] || { compose logs --tail=80 app; fail "The app did not become healthy."; }

log "Reference data"
seeded=$(compose exec -T app php artisan tinker --execute='echo Spatie\Permission\Models\Role::query()->exists() ? "yes" : "no";' </dev/null | tr -d '[:space:]')
if [ "${seeded}" = no ]; then
    echo "New database: roles, first admin, settings, regions and taxonomy."
    compose exec -T app php artisan db:seed --class=ProductionSeeder --force
else
    # The office edits the settings, page content and taxonomy; only roles and permissions follow the code.
    echo "Existing database: roles and permissions only."
    compose exec -T app php artisan db:seed --class=RolePermissionSeeder --force
fi
compose exec -T queue php artisan queue:restart >/dev/null

log "Traefik route: adriaholiday.hu → ${APP_NAME}-nginx-1"
ROUTE_FILE=${TRAEFIK_DYNAMIC_DIR}/${APP_NAME}.yml
REFERENCE_ROUTE=$(sudo_if_needed "${TRAEFIK_DYNAMIC_DIR}" find "${TRAEFIK_DYNAMIC_DIR}" -maxdepth 1 -name '*.yml' ! -name "${APP_NAME}.yml" | head -1 || true)
ENTRYPOINT=websecure
CERT_RESOLVER=letsencrypt

if [ -n "${REFERENCE_ROUTE}" ]; then
    found=$(sudo_if_needed "${REFERENCE_ROUTE}" cat "${REFERENCE_ROUTE}" | grep -m1 -A1 'entryPoints:' | tail -1 | sed 's/[-" ]//g' || true)
    [ -n "${found}" ] && ENTRYPOINT=${found}
    found=$(sudo_if_needed "${REFERENCE_ROUTE}" cat "${REFERENCE_ROUTE}" | grep -m1 'certResolver:' | awk -F: '{print $2}' | tr -d ' "' || true)
    [ -n "${found}" ] && CERT_RESOLVER=${found}
fi

sed -e "s/__ENTRYPOINT__/${ENTRYPOINT}/" -e "s/__CERT_RESOLVER__/${CERT_RESOLVER}/" deploy/production/traefik-route.yml.template >/tmp/${APP_NAME}-route.yml
sudo_if_needed "${ROUTE_FILE}" install -m 644 /tmp/${APP_NAME}-route.yml "${ROUTE_FILE}"
rm -f /tmp/${APP_NAME}-route.yml
echo "Route written (entry point ${ENTRYPOINT}, cert resolver ${CERT_RESOLVER})."

log "Smoke check through nginx"
docker exec "${APP_NAME}-nginx-1" wget -qO- --header 'Host: adriaholiday.hu' http://127.0.0.1/health || fail "Health check failed."
echo

if [ -n "${IMPORT_FILE}" ]; then
    [ -f "${IMPORT_FILE}" ] || fail "Import file not found: ${IMPORT_FILE}"
    log "Legacy import (runs in the background; images are copied from the legacy site)"
    compose exec -T app mkdir -p storage/app/private
    docker cp "${IMPORT_FILE}" "${APP_NAME}-app-1:/var/www/backend/storage/app/private/legacy-export.json"
    compose exec -T -d app sh -c 'php artisan adria:legacy:import storage/app/private/legacy-export.json --force --media=listed -v > storage/logs/legacy-import.log 2>&1'
    echo "Follow it with: docker exec ${APP_NAME}-app-1 tail -f storage/logs/legacy-import.log"
fi

log "Done"
echo "Admin: https://adriaholiday.hu/admin  user: $(grep '^ADMIN_SEED_EMAIL=' "${LARAVEL_ENV}" | cut -d= -f2-)"
echo "Admin password: grep ADMIN_SEED_PASSWORD ${APP_DIR}/${LARAVEL_ENV}"
