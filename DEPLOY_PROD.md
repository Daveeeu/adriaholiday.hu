# Production Deploy Stack

Ez a repo productionban teljes Laravel + React stackként fut:

- `nginx` reverse proxy és static asset kiszolgálás
- `app` PHP-FPM Laravel runtime
- `queue` Redis alapú worker
- `scheduler` külön scheduler container
- `redis` cache + queue backend
- külső MySQL/MariaDB vagy PostgreSQL adatbázis

Node csak build-time kell. Runtime-ban nincs Node konténer.

## Konténerek

- `nginx`: publikus entrypoint, `/health` reverse proxy, `backend/public` assetek kiszolgálása
- `app`: Laravel application bootstrap, migrációk, cache-ek, `php-fpm`
- `queue`: `php artisan queue:work redis`
- `scheduler`: percenként `php artisan schedule:run`
- `redis`: appendonly persistence queue/cache célra

## Fájlok

- [`docker-compose.prod.yml`](/Users/jandl.david/Developer/adriaholiday.hu/docker-compose.prod.yml)
- [`Dockerfile`](/Users/jandl.david/Developer/adriaholiday.hu/Dockerfile)
- [`backend/Dockerfile`](/Users/jandl.david/Developer/adriaholiday.hu/backend/Dockerfile)
- [`nginx.conf`](/Users/jandl.david/Developer/adriaholiday.hu/nginx.conf)
- [`backend/.env.production.example`](/Users/jandl.david/Developer/adriaholiday.hu/backend/.env.production.example)
- [`/.env.production.example`](/Users/jandl.david/Developer/adriaholiday.hu/.env.production.example)

## Environment split

Két env fájl kell:

1. Root compose/build env: `.env.production`
2. Laravel runtime env: `backend/.env.production`

Ajánlott:

```bash
cp .env.production.example .env.production
cp backend/.env.production.example backend/.env.production
```

## Kötelező env változók

### Root `.env.production`

- `APP_IMAGE_TAG`
- `EDGE_NETWORK_NAME`
- `NGINX_HTTP_PORT`
- `LARAVEL_ENV_FILE`
- `PORTFOLIO_VITE_API_BASE_URL`
- `PORTFOLIO_VITE_SITE_URL`
- `PORTFOLIO_VITE_ANALYTICS_ENABLED`
- `PORTFOLIO_VITE_ANALYTICS_DEBUG`
- `PORTFOLIO_VITE_ANALYTICS_SESSION_COOKIE`
- `PORTFOLIO_VITE_META_PIXEL_ENABLED`
- `PORTFOLIO_VITE_META_PIXEL_ID`
- `ADMIN_VITE_API_BASE_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `REDIS_PASSWORD`
- `QUEUE_WORKER_*`

### `backend/.env.production`

- `APP_NAME`
- `APP_ENV=production`
- `APP_KEY`
- `APP_URL`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`
- `REDIS_PASSWORD`
- `CACHE_STORE=redis`
- `SESSION_DRIVER=database`
- `QUEUE_CONNECTION=redis`
- `LOG_CHANNEL=stack`
- `LOG_STACK=stderr,daily`
- `ANALYTICS_*`
- `META_*`
- opcionális: `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`

## Build folyamat

Build-time lépések:

1. Portfolio frontend build (`npm run build`)
2. Admin frontend build (`cd adria-admin && npm run build`)
3. Composer production install
4. Assetek bemásolása a backend public könyvtárba
5. Nginx és PHP-FPM image build

Docker build során ezek automatikusan megtörténnek a multi-stage image-ekben.

## Deploy lépések

```bash
cp .env.production.example .env.production
cp backend/.env.production.example backend/.env.production
```

Állítsd be a valós secret értékeket, majd:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Az `app` entrypoint automatikusan futtatja:

```bash
php artisan storage:link
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Laravel production parancsok

Az alábbiak a stack részei:

- `php artisan config:cache`
- `php artisan route:cache`
- `php artisan view:cache`
- `php artisan migrate --force`
- `php artisan storage:link`
- `php artisan queue:work redis`
- `php artisan schedule:run`

Kézi futtatás:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan config:cache
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan route:cache
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan view:cache
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan migrate --force
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan storage:link
docker compose --env-file .env.production -f docker-compose.prod.yml exec queue php artisan queue:restart
docker compose --env-file .env.production -f docker-compose.prod.yml exec scheduler php artisan schedule:run
```

## Queue

- Backend: Redis queue (`QUEUE_CONNECTION=redis`)
- Worker: külön `queue` container
- Failed job storage: `failed_jobs` tábla
- Restart stratégia:
  - deploy után `php artisan queue:restart`
  - container `restart: unless-stopped`
  - worker rotation: `--max-jobs`, `--max-time`
- Failed job kezelés:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan queue:failed
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan queue:retry all
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan queue:flush
```

A scheduler naponta futtatja:

- `php artisan queue:prune-failed --hours=168`

## Scheduler

A `scheduler` container percenként futtatja:

```bash
php artisan schedule:run --verbose --no-interaction
```

Ez külön konténer, nem host cron.

## Persistent storage

Perzisztens Docker volume-ok:

- `laravel-storage`
- `laravel-cache`
- `redis-data`

Mit tárolnak:

- user uploadok és media assetek
- Laravel logok
- framework cache/session/view fájlok
- Redis appendonly adat

## Logs

Laravel:

- konténer stdout/stderr
- valamint `storage/logs/laravel.log`

Nginx:

- access log: stdout
- error log: stderr

Ajánlott parancsok:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f nginx
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f queue
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f scheduler
```

## Health és monitoring

Publikus health endpoint:

- `GET /health`

Ellenőriz:

- DB kapcsolat
- Redis kapcsolat
- storage írhatóság
- public storage symlink
- queue backend elérhetőség

Példák:

```bash
curl -fsS https://adriaholiday.hu/health | jq
curl -fsS https://adriaholiday.hu/up
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan app:healthcheck --json
```

Queue health:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 queue
docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan queue:failed
```

## HTTPS-ready konfiguráció

- Nginx támogatja a reverse-proxy HTTPS header forwardolást
- Ha Traefik/Nginx Proxy Manager/ALB terminálja a TLS-t, továbbítsa:
  - `X-Forwarded-Proto`
  - `X-Forwarded-For`
  - `X-Forwarded-Host`

Publikus publish ajánlás:

- `nginx` csak belső hálózaton vagy edge proxy mögött fusson
- cert management az edge layeren történjen

## Backup stratégia

### DB backup

Napi dump host cronból vagy CI/CD scheduled jobból:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T app \
  sh -lc 'mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE"' \
  > backups/db/$(date +%F)-adriaholiday.sql
```

### Storage backup

```bash
docker run --rm \
  -v adriaholiday_hu_laravel-storage:/source:ro \
  -v "$(pwd)/backups/storage:/backup" \
  alpine:3.22 \
  sh -lc 'tar -czf /backup/storage-$(date +%F).tar.gz -C /source .'
```

### Retention

- DB dump: 14 napi
- storage backup: 7 napi napi snapshot + heti 4 snapshot
- offsite másolat: S3 / object storage / Hetzner Storage Box

Példa retention cleanup:

```bash
find backups/db -type f -mtime +14 -delete
find backups/storage -type f -mtime +30 -delete
```

### Restore flow

1. Maintenance mode bekapcsolás
2. DB restore
3. Storage volume restore
4. `php artisan migrate --force`
5. `php artisan config:cache && php artisan route:cache && php artisan view:cache`
6. queue restart
7. Maintenance mode kikapcsolás

DB restore példa:

```bash
cat backups/db/2025-07-02-adriaholiday.sql | docker compose --env-file .env.production -f docker-compose.prod.yml exec -T app \
  sh -lc 'mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE"'
```

## Rollback

1. Előző image tag visszaállítása `.env.production` fájlban
2. régi compose stack indítása
3. szükség esetén DB restore
4. queue restart

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Ha schema rollback kell, azt csak előre tervezett migrációval vagy backup restore-ral csináld, ne automatikus `migrate:rollback`-kal productionben.

## Troubleshooting

`/health` 503:

- ellenőrizd a DB elérést
- ellenőrizd a Redis jelszót
- nézd meg a `storage` és `bootstrap/cache` write jogosultságokat
- futtasd: `php artisan app:healthcheck --json`

Worker nem dolgoz fel jobot:

- `QUEUE_CONNECTION=redis`
- `REDIS_QUEUE=default`
- `docker compose logs queue`
- `php artisan queue:failed`

Admin/portfolio asset 404:

- image rebuild szükséges
- ellenőrizd, hogy a build stage sikeres volt
- ellenőrizd a `backend/public/admin` és `backend/public/portfolio` tartalmat

Storage file 404:

- `php artisan storage:link`
- `laravel-storage` volume mount

## Gyors ellenőrző lista

- `docker compose --env-file .env.production -f docker-compose.prod.yml config`
- `curl https://your-domain/health`
- `docker compose --env-file .env.production -f docker-compose.prod.yml ps`
- `docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 queue`
- `docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan app:healthcheck --json`
