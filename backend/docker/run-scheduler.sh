#!/usr/bin/env sh
set -eu

cd /var/www/backend

php artisan config:cache

while true; do
  php artisan schedule:run --verbose --no-interaction
  sleep 60
done
