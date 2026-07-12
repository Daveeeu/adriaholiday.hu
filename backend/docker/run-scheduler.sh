#!/usr/bin/env sh
set -eu

cd /var/www/backend

# public/ isn't on the shared laravel-storage volume, so each container built
# from this image needs its own storage:link (app-entrypoint's run doesn't
# carry over here since queue/scheduler override the image entrypoint).
php artisan storage:link --force >/dev/null 2>&1 || true
php artisan config:cache

while true; do
  php artisan schedule:run --verbose --no-interaction
  sleep 60
done
