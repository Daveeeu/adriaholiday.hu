#!/usr/bin/env sh
set -eu

# The healthcheck requires this file, so the container only reports healthy
# once the caches below are written. A restart keeps /tmp, hence the rm.
READY_FILE=/tmp/app-ready
rm -f "$READY_FILE"

cd /var/www/backend

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs storage/app/public bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache

php artisan storage:link --force >/dev/null 2>&1 || true
php artisan package:discover --ansi
# Cache this release's config before migrating: bootstrap/cache is a volume,
# so migrations would otherwise read the previous release's config.
php artisan config:cache
php artisan migrate --force --isolated
php artisan route:cache
php artisan view:cache

touch "$READY_FILE"

exec "$@"
