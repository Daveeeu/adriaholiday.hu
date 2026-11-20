# Production server

adriaholiday.hu moves to its own VPS at SzerverPlex (prepared on 2026-11-20; the DNS cutover follows):

- **Host:** `217.144.53.32` (IPv6 `2a02:c647:0:fe::8e`), hostname `adriaholiday-prod`.
- **Size:** 2 cores, 4 GB RAM, 40 GB disk, Ubuntu 26.04 LTS.
- **SSH:** `ssh -i ~/.ssh/adriaholiday_vps jandldavid@217.144.53.32`. Keys only; the admin user has passwordless sudo.
- **Panel and console:** the SzerverPlex client area (`ugyfelkapu.szerverplex.hu`), service "adriaholiday.hu". The noVNC console drops the Shift key, so type only lowercase there.

Before that it ran on the shared Docker host `217.144.53.91`. That host still has the old stack (stopped) and its database volume for a rollback.

## Layout

| Path | What |
| --- | --- |
| `/srv/apps/traefik` | Traefik (`deploy/production/traefik/compose.yml`), routes in `dynamic/` |
| `/srv/data/traefik` | `acme.json` and the certificates copied from the old host (`certs/`) |
| `/srv/apps/adriaholiday` | Git checkout of `main`, `.env.production`, `backend/.env.production` |
| `/srv/backups/adriaholiday` | Hourly database dumps (`db/`) and a read-only view of the media (`media/`) |

The stack is `docker-compose.prod.yml` plus two files from `deploy/production`:

- `compose.server.yml`: nginx has no host port; Traefik reaches it over the `platform` network.
- `compose.mariadb.yml`: the stack's own MariaDB (`adriaholiday-db-1`, volume `adriaholiday_mariadb-data`). `DATABASE_STACK=mariadb` in `.env.production` keeps it. `compose.platform-postgres.yml` is only for a host with a shared Postgres.

## Setting up a new host

1. Install Ubuntu Server with OpenSSH. Add the admin user's SSH key and give the user passwordless sudo (`/etc/sudoers.d/90-<user>`).
2. Copy this repository's `deploy/production` to the host and run `bash provision-host.sh`. It is idempotent. It sets up:
   - security updates with an automatic reboot at 04:30 when a kernel update needs it;
   - UFW with only 22, 80 and 443 open;
   - fail2ban for SSH;
   - key-only SSH with no root login;
   - Docker with log rotation;
   - the `platform` network and Traefik.

   Do not probe port 22 with `nc` or many short connections: fail2ban bans the address for an hour. Unban it from another address with `sudo fail2ban-client set sshd unbanip <ip>`.
3. Deploy the app with `bootstrap.sh` (next section). To move existing data, copy the two env files from the old host first, then copy the database dump and the `adriaholiday_laravel-storage` volume, then run the bootstrap.
4. Set up the backups (see "Backups").

## Deploys

On the server, as the admin user:

```bash
cd /srv/apps/adriaholiday && bash deploy/production/bootstrap.sh
```

`bootstrap.sh` is idempotent. On every run it:

1. Clones or updates `/srv/apps/adriaholiday` to `main`.
2. Picks the database. An install whose `.env.production` has `DB_HOST=db` keeps its MariaDB; otherwise it uses the platform Postgres.
3. Writes `.env.production` and `backend/.env.production` once. They hold generated secrets (mode 600) and are never committed.
4. Builds the images and starts the stack. The entrypoint runs the migrations and writes the caches; the app only reports healthy after that.
5. Seeds the reference data. A new database gets `ProductionSeeder`; an existing one only gets `RolePermissionSeeder`, so the office's settings and content are never reset.
6. Writes the Traefik route `/srv/apps/traefik/dynamic/adriaholiday.yml` for `PUBLIC_HOST`, with `www` and the old staging host redirecting to the apex.
7. Runs a health check through nginx.

Optional environment variables:

- `ADMIN_EMAIL`: the first admin of a new database.
- `MAIL_*`: real SMTP. Production uses `smtp.rackhost.hu`.
- `BRANCH`: the branch to deploy (default `main`).
- `PUBLIC_HOST`: kept in `.env.production`.
- `--import <file>`: imports a legacy admin export (`docs/legacy-admin-export-import.md`).

Never run two deploys at once: they overwrite each other's images.

## Backups

The VPS keeps the dumps and the off-site server `server1.jandldavid.hu` pulls them.

- **VPS side (`deploy/production/backup-host.sh`):**
  - The `adriaholiday-db-dump.timer` dumps the database every hour at :05 into `/srv/backups/adriaholiday/db` and keeps the last 48 dumps.
  - The uploaded media is bind-mounted read-only at `/srv/backups/adriaholiday/media`.
  - The `adriabackup` user can only read that directory over rsync (`rrsync -ro`), with server1's key.
- **server1 side (`deploy/production/backup-pull.sh`, installed as `~/bin/adriaholiday-backup-pull` for `jandldavid`):**
  - Cron runs it every hour at :20. It rsyncs the directory into `~/backups/adriaholiday/mirror` and stores a restic snapshot in `~/backups/adriaholiday/restic`.
  - At 03:00 it keeps 48 hourly, 30 daily, 12 weekly and 12 monthly snapshots, and checks the repository.
  - `~/backups/adriaholiday/last-success` holds the time of the last good run.

The VPS cannot reach server1, so a compromised VPS cannot delete the history.

The restic password is in `~/.config/restic/adriaholiday.pass` on server1. Keep a copy in the password manager: the snapshots are unreadable without it.

To restore a dump, on server1:

```bash
export RESTIC_REPOSITORY=~/backups/adriaholiday/restic RESTIC_PASSWORD_FILE=~/.config/restic/adriaholiday.pass
restic snapshots
restic restore latest --target /tmp/restore --include '*/db/*'
```

Then stream the chosen `.sql.gz` into the VPS:

```bash
gunzip -c <file> | ssh -i ~/.ssh/adriaholiday_vps jandldavid@217.144.53.32 \
  "docker exec -i adriaholiday-db-1 sh -c 'mariadb -u root -p\"\$MARIADB_ROOT_PASSWORD\" adriaholiday'"
```

## Day to day

```bash
cd /srv/apps/adriaholiday
C="docker compose --project-name adriaholiday --env-file .env.production -f docker-compose.prod.yml -f deploy/production/compose.server.yml -f deploy/production/compose.mariadb.yml"
$C ps
$C logs -f app
$C exec -T app php artisan <command>
```

- **Health:** `https://adriaholiday.hu/health`.
- **Disk:** `df -h /`. `docker builder prune -f` reclaims the build cache after deploys.
