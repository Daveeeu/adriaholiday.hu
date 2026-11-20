# Operations: monitoring, alerts and the monthly routine

What the operations contract (Standard package) needs, and where each piece runs:

| Contract item | Implementation | Runs on |
| --- | --- | --- |
| Uptime monitoring, 4-hour response to critical incidents | Uptime Kuma, alerts to ntfy | server1 |
| Off-site backup that is known to work | `adriaholiday-backup-pull` pings Kuma | server1 |
| Server health (disk, containers, certificate) | `adriaholiday-health-check` timer → status file → Kuma | VPS + server1 |
| Monitoring of the monitoring | Watchdog in `adriaholiday-health-check` | VPS |
| Security updates | Dependabot PRs + monthly routine below | GitHub |
| Security audit (vulnerability scan) | `adriaholiday-monthly-audit` + `adriaholiday-image-scan` | server1 + VPS |
| Monthly SEO report | OpenSEO project "adriaholiday.hu" + report template | server1 (seo.jandldavid.hu) |

No personal data leaves the servers: alerts carry monitor names, URLs and short
status messages only. ntfy.sh receives them on a topic whose random name is the
secret. Do not put customer data into alert messages.

## Alerts

All alerts go to the ntfy topic stored in Uptime Kuma (Settings → Notifications)
and in `/etc/adriaholiday/monitor.env` on the VPS. Subscribe to it in the ntfy app
(server `https://ntfy.sh`). To move to another channel, add it in Kuma, make it
the default and apply it to all monitors; change `NTFY_URL` on the VPS too.

| Alert | Meaning | First steps |
| --- | --- | --- |
| `adriaholiday.hu /health` down | The public site or one of its checks (DB, Redis, storage, queue) fails | Open `/health`, then `docker compose ps` and `logs app` on the VPS |
| `adriaholiday.hu főoldal` down | The homepage does not answer 2xx | As above; check Traefik |
| `VPS közvetlen /health` down | The VPS itself fails, whatever DNS says | Same; if only this one is down before the cutover, the old host still serves the site |
| Certificate expiry (on `főoldal`) | The public certificate expires in 21/14/7 days | Traefik renews automatically: check its logs |
| `VPS tanúsítvány` down | The VPS certificate for adriaholiday.hu expires in < 14 days | `docker logs traefik-traefik-1` |
| `VPS lemez` down | `/` above 85% | `docker builder prune`, old images, `/srv/backups` (see production-server.md) |
| `VPS konténerek` down | An `adriaholiday-*` container is stopped, unhealthy or missing | `docker ps -a`, logs of the named service |
| `VPS …` monitors silent | The VPS status file is not reachable or older than 15 minutes | Is the VPS up? `systemctl status adriaholiday-health-check.timer` |
| `Backup pull (server1)` down or silent for 3 hours | No backup stored in the last 3 hours | `~/backups/adriaholiday/pull.log` on server1 |
| `server1 monitoring csendes` (sent by the VPS) | No Uptime Kuma request reached the site for 15 minutes: server1 or Kuma is down, so the alerts above are silent too | Check server1 and `docker ps` there |
| `Havi biztonsági audit` down | The monthly audit found HIGH/CRITICAL issues or failed | Read the report (below) |

**Limitation.** server1 is a home server. While it is down, the VPS watchdog is
the only alert, and it only fires if the VPS itself is up. If both are down at
once nothing alerts. Both machines failing together is unlikely, but a check
from a third place (for example a free external uptime service) would close the
gap if the contract ever needs it.

## Uptime Kuma (server1)

- Compose file: `deploy/monitoring/compose.uptime-kuma.yml`, installed as
  `~/uptime-kuma/compose.yml`, project `uptime-kuma`, data in the
  `uptime-kuma_uptime-kuma-data` volume. `restart: unless-stopped`, so it comes
  back after a reboot.
- It listens on `127.0.0.1:3012` only. Open it through an SSH tunnel:

  ```bash
  ssh -L 3012:localhost:3012 server1.jandldavid.hu
  ```

  then http://localhost:3012 (own login).
- Monitors: the HTTP checks in the alert table, plus push monitors that the
  scripts below call. Push URLs are `http://127.0.0.1:3012/api/push/<token>`; the
  tokens live only in Kuma and in `~/.config/adriaholiday/monitoring.env`
  (mode 600) on server1.
- The "VPS közvetlen" check calls `https://217.144.53.32/health` with the header
  `Host: adriaholiday.hu` and TLS verification off, so it monitors the VPS before
  and after the DNS cutover. The VPS certificate is checked separately by the
  health check.

Update: change the image tag in the compose file, copy it to server1, then
`docker compose -p uptime-kuma -f ~/uptime-kuma/compose.yml up -d`.

## VPS health (VPS → server1)

The VPS cannot reach server1, and server1's Kuma is not public, so the VPS does
not push. Instead:

1. `adriaholiday-health-check` (`deploy/production/health-check.sh`, systemd timer,
   every 5 minutes, root) writes `/srv/backups/adriaholiday/health/status`: disk
   usage of `/`, the state of every `adriaholiday-*` container (one-off
   `compose run` containers ignored; `app nginx db redis` must exist), and the
   days left on the certificate Traefik serves for adriaholiday.hu.
2. `adriaholiday-vps-health-pull` (`deploy/monitoring/vps-health-pull.sh`, cron
   every 5 minutes on server1) reads that file with the existing read-only backup
   key and pushes up/down with the reason to the `VPS lemez`, `VPS konténerek` and
   `VPS tanúsítvány` monitors.

The same health check is the watchdog for server1: Uptime Kuma requests the site
every minute, so when `adriaholiday-nginx-1` has logged no `Uptime-Kuma` request
for 15 minutes it sends one ntfy alert, and one more when they return.

Install or update on the VPS (after `backup-host.sh`):

```bash
NTFY_URL=https://ntfy.sh/<topic> bash deploy/production/monitor-host.sh
```

Thresholds can be overridden in `/etc/adriaholiday/monitor.env`:
`DISK_LIMIT_PERCENT` (85), `CERT_MIN_DAYS` (14), `REQUIRED_CONTAINERS`,
`WATCHDOG_MINUTES` (15). When the scheduler and queue containers start after the
cutover they are watched automatically; add them to `REQUIRED_CONTAINERS` to also
alert when they are missing.

## Backup freshness

`deploy/production/backup-pull.sh` (installed as `~/bin/adriaholiday-backup-pull`,
cron at :20) reads `BACKUP_PING_URL` from the environment or from
`~/.config/adriaholiday/monitoring.env`. It pushes `up` after every stored backup
and `down` when a run fails. When some files cannot be read (rsync exit 23/24)
the rest, including the database dumps, is still stored, and the run is reported
as failed. The `Backup pull (server1)` monitor alerts when no successful run was
reported for 3 hours.

Files written into the app storage as root (for example by `docker exec
adriaholiday-app-1 php artisan …`) are not readable by the backup user and make
the pull fail. Run artisan as the app user: `docker exec -u www-data …`.

## server1 crontab

```text
20 * * * *   $HOME/bin/adriaholiday-backup-pull >> $HOME/backups/adriaholiday/pull.log 2>&1
*/5 * * * *  $HOME/bin/adriaholiday-vps-health-pull >> $HOME/backups/adriaholiday/vps-health.log 2>&1
0 7 1 * *    $HOME/bin/adriaholiday-monthly-audit >> $HOME/ops/adriaholiday/audit.log 2>&1
```

The scripts are copies of the repository files; after changing one, copy it
again (`ssh server1.jandldavid.hu 'cat > ~/bin/<name>' < <file>`).

## Monthly routine (first working days of the month)

Automated on the 1st:

- 03:30 on the VPS: `adriaholiday-image-scan` (`deploy/production/image-scan.sh`)
  scans the images the app and nginx containers run with Trivy (HIGH/CRITICAL).
- 07:00 on server1: `adriaholiday-monthly-audit` (`deploy/monitoring/monthly-audit.sh`)
  runs `composer audit` and `npm audit` (site, adria-admin) on `origin/main`,
  collects the Trivy report, checks the security headers, scans the VPS for open
  ports (top 1000, port 22 skipped so fail2ban never sees the scan), runs
  testssl.sh against the VPS and asks the Mozilla HTTP Observatory for a grade.
  Report: `~/ops/adriaholiday/reports/YYYY-MM-security.md` on server1, raw output
  in `YYYY-MM-raw/`. The `Havi biztonsági audit` monitor turns red when there is
  anything HIGH/CRITICAL.

By hand:

1. **Read the security report.** Anything critical or exploitable from the
   internet (authentication, request handling) is fixed the same week, not
   batched.
2. **Merge the Dependabot PRs.** Version updates arrive monthly, security
   updates as soon as an advisory appears. For each: check the changelog for
   breaking changes, run the checks locally (`composer test` / PHPUnit in the
   background, `npm run lint && npm run build` in the root and in `adria-admin`).
3. **Update what Dependabot does not cover:** the PHP extensions and Alpine
   packages come with the base images, so rebuilding the images is the update.
   Fixable Trivy findings disappear after a rebuild; if not, bump the base image
   tag in `Dockerfile` / `backend/Dockerfile`.
4. **Release:** merge to `main`, then tag it (`git tag v1.5.0 && git push origin v1.5.0`).
   The release workflow tests, builds and deploys it (docs/release-pipeline.md).
   Check the Kuma dashboard afterwards.
5. **Rerun the audit** to confirm and clear the monitor:
   `ssh server1.jandldavid.hu ~/bin/adriaholiday-monthly-audit`.
6. **SEO report** (below), sent to the client together with a short note on the
   updates and incidents of the month.
7. **Restore test** once a quarter: restore the latest database dump from the
   restic repository on server1 into a scratch MariaDB container and count rows.

## Monthly SEO report

OpenSEO runs on server1 (`~/open-seo/deploy/standalone`, https://seo.jandldavid.hu,
own password login). The project "adriaholiday.hu" is connected to the
Search Console property `https://adriaholiday.hu/` and the GA4 property
`adriaholiday.hu` (both through jandldavid0@gmail.com), has a weekly mobile rank
tracker (20 keywords, Hungary) and site audits.

The report template **"Havi SEO riport – Adria-Holiday Kft."** in the project's
Reports → Templates holds the Hungarian, client-ready structure: summary, Search
Console, top queries, GA4 organic traffic, keyword positions, technical SEO, work
done, next steps. Each month, after the 4th (Search Console lags ~3 days):

1. In OpenSEO, run a new site audit (with Lighthouse) on https://adriaholiday.hu/.
2. Ask Claude (with the OpenSEO MCP, `https://seo.jandldavid.hu/mcp`) for the
   "Havi SEO riport – Adria-Holiday Kft." for the previous calendar month. It
   pulls the data, follows the template and saves the report in the project.
3. Read it, then print it to PDF from OpenSEO and send it to the client.

The first report, "Havi SEO riport – indulási állapot, 2026. november 20.", is the
baseline for the following months.
