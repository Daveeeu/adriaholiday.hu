#!/usr/bin/env sh
set -eu

cd /var/www/backend

php artisan config:cache
php artisan queue:restart || true

exec php artisan queue:work redis \
  --queue="${QUEUE_WORKER_QUEUE:-default}" \
  --sleep="${QUEUE_WORKER_SLEEP:-3}" \
  --tries="${QUEUE_WORKER_TRIES:-3}" \
  --timeout="${QUEUE_WORKER_TIMEOUT:-120}" \
  --backoff="${QUEUE_WORKER_BACKOFF:-5}" \
  --memory="${QUEUE_WORKER_MEMORY:-256}" \
  --max-jobs="${QUEUE_WORKER_MAX_JOBS:-500}" \
  --max-time="${QUEUE_WORKER_MAX_TIME:-3600}" \
  --verbose
