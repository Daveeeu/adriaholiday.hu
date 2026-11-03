# Production: the shared Docker host

adriaholiday.hu runs on the shared Debian Docker host (`217.144.53.91`). The host runs:

- **Traefik:** HTTPS and routing, with a file provider in `/srv/apps/traefik/dynamic`.
- **Platform Postgres:** `platform-postgres-1`.
- **Mailpit, Dozzle and Uptime Kuma.**

The stack itself is `docker-compose.prod.yml` plus two files from `deploy/production`:

- `compose.server.yml`: nginx has no host port; Traefik reaches it over its own network. The stack keeps its own Redis.
- The database file, chosen by `DATABASE_STACK` in `.env.production`:
  - `compose.platform-postgres.yml`: the Laravel containers use the platform Postgres (database `adriaholiday`). New installs get this.
  - `compose.mariadb.yml`: the stack's own MariaDB (`adriaholiday-db-1`, volume `adriaholiday_mariadb-data`). The install that already ran on it keeps it, with its data.

## First install and redeploys

On the server, as the deploy user:

```bash
curl -fsSL https://raw.githubusercontent.com/Daveeeu/adriaholiday.hu/main/deploy/production/bootstrap.sh -o bootstrap.sh
bash bootstrap.sh --import ~/adriaholiday_export_v2.json   # the import only on the first run
```

`bootstrap.sh` is idempotent. On every run it:

1. Clones or updates `/srv/apps/adriaholiday` to `main`.
2. Picks the database: an install whose `.env.production` has `DB_HOST=db` keeps its MariaDB; otherwise the platform Postgres.
3. Finds the Traefik network and, for Postgres, its network. Creates the Postgres role and database once.
4. Writes `.env.production` and `backend/.env.production` once. They hold generated secrets (mode 600) and are never committed.
5. Builds the images and starts the stack. The entrypoint runs the migrations.
6. Seeds the reference data. A new database gets `ProductionSeeder`: roles, the first admin, settings, regions and taxonomy, with no demo data. An existing database only gets `RolePermissionSeeder`, so the office's settings and content are never reset.
7. Writes the Traefik route `/srv/apps/traefik/dynamic/adriaholiday.yml`. Its entry point and cert resolver are copied from an existing route. It serves `PUBLIC_HOST` and sets `APP_URL` to it. Until the domain switch that is the staging host `adriaholiday.jandldavid.hu`; after it, `adriaholiday.hu`, with `www` and the staging host redirecting there. Its names start with `adriaholiday-hu`, so they never clash with another route file.
8. Runs a health check through nginx.

With `--import`, the legacy admin export is imported in the background (`docs/legacy-admin-export-import.md`), and the images are copied from the legacy site.

Optional environment variables:

- `ADMIN_EMAIL`: the first admin; the password is generated into `backend/.env.production` as `ADMIN_SEED_PASSWORD`.
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SCHEME`: real SMTP. Without them, mail goes to Mailpit.
- `BRANCH`: the branch to deploy (default `main`).
- `PUBLIC_HOST`: `adriaholiday.jandldavid.hu` (default) or `adriaholiday.hu`. It is kept in `.env.production`, so a redeploy never switches the domain by itself.

## Order of the switch

The import copies images from `https://adriaholiday.hu`. Keep the domain on the legacy server until the import has finished:

```bash
docker exec adriaholiday-app-1 tail -f storage/logs/legacy-import.log
```

The switch is the last step. Point the A records of `adriaholiday.hu` and `www.adriaholiday.hu` to `217.144.53.91`, then:

```bash
PUBLIC_HOST=adriaholiday.hu bash bootstrap.sh
```

Traefik issues the certificate on the first request; `www` and `adriaholiday.jandldavid.hu` redirect to the apex.

## Day to day

```bash
cd /srv/apps/adriaholiday
DB_FILE=deploy/production/compose.$(grep '^DATABASE_STACK=' .env.production | cut -d= -f2).yml
docker compose --project-name adriaholiday --env-file .env.production -f docker-compose.prod.yml -f deploy/production/compose.server.yml -f "$DB_FILE" ps
docker compose --project-name adriaholiday --env-file .env.production -f docker-compose.prod.yml -f deploy/production/compose.server.yml -f "$DB_FILE" logs -f app
```

- **Logs on the web:** https://logs.jandldavid.hu
- **Monitoring:** add `https://adriaholiday.hu/health` to Uptime Kuma.
