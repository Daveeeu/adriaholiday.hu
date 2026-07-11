# syntax=docker/dockerfile:1.7

FROM composer:2.8 AS composer-deps
WORKDIR /app/backend
COPY backend/composer.json backend/composer.lock ./
# The composer:2.8 image's bundled PHP doesn't have ext-exif (spatie/image and
# spatie/laravel-medialibrary require it), but the runtime stage below installs
# it via docker-php-ext-install before the vendor/ directory built here gets
# copied in, so it's safe to skip this stage's platform check for it.
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader --no-scripts --ignore-platform-req=ext-exif

FROM node:20-alpine AS portfolio-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG PORTFOLIO_VITE_API_BASE_URL=/api
ARG PORTFOLIO_VITE_SITE_URL=https://adriaholiday.hu
ARG PORTFOLIO_VITE_ANALYTICS_ENABLED=true
ARG PORTFOLIO_VITE_ANALYTICS_DEBUG=false
ARG PORTFOLIO_VITE_ANALYTICS_SESSION_COOKIE=ah_session_id
ARG PORTFOLIO_VITE_META_PIXEL_ENABLED=false
ARG PORTFOLIO_VITE_META_PIXEL_ID=
ENV VITE_API_BASE_URL=${PORTFOLIO_VITE_API_BASE_URL}
ENV VITE_SITE_URL=${PORTFOLIO_VITE_SITE_URL}
ENV VITE_ANALYTICS_ENABLED=${PORTFOLIO_VITE_ANALYTICS_ENABLED}
ENV VITE_ANALYTICS_DEBUG=${PORTFOLIO_VITE_ANALYTICS_DEBUG}
ENV VITE_ANALYTICS_SESSION_COOKIE=${PORTFOLIO_VITE_ANALYTICS_SESSION_COOKIE}
ENV VITE_META_PIXEL_ENABLED=${PORTFOLIO_VITE_META_PIXEL_ENABLED}
ENV VITE_META_PIXEL_ID=${PORTFOLIO_VITE_META_PIXEL_ID}
RUN npm run build

FROM node:20-alpine AS admin-build
WORKDIR /app
COPY adria-admin/package.json adria-admin/package-lock.json ./adria-admin/
RUN npm ci --prefix ./adria-admin
COPY adria-admin ./adria-admin
ARG ADMIN_VITE_API_BASE_URL=/api/admin
ENV VITE_API_BASE_URL=${ADMIN_VITE_API_BASE_URL}
RUN npm run build --prefix ./adria-admin

FROM php:8.4-fpm-alpine AS runtime
WORKDIR /var/www/backend

RUN apk add --no-cache \
    bash \
    fcgi \
    icu-data-full \
    icu-libs \
    libpng \
    libjpeg-turbo \
    freetype \
    libzip \
    oniguruma \
    mariadb-client \
    postgresql-client \
    shadow \
    su-exec \
    unzip \
    tzdata \
    curl-dev \
    icu-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    $PHPIZE_DEPS \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j"$(nproc)" bcmath exif gd intl opcache pcntl pdo_mysql pdo_pgsql zip \
 && pecl install redis \
 && docker-php-ext-enable redis \
 && apk del --no-network curl-dev icu-dev libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev oniguruma-dev postgresql-dev $PHPIZE_DEPS

COPY backend/docker/php/conf.d/production.ini /usr/local/etc/php/conf.d/production.ini
COPY backend/docker/php-fpm/www.conf /usr/local/etc/php-fpm.d/www.conf

COPY backend /var/www/backend
COPY --from=composer-deps /app/backend/vendor /var/www/backend/vendor
COPY --from=portfolio-build /app/backend/public /var/www/backend/public
# adria-admin's vite.config.ts outDir resolves to backend/public/admin (not
# adria-admin/dist), so that's what actually exists after the build above.
COPY --from=admin-build /app/backend/public/admin /var/www/backend/public/admin

RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache \
 && chown -R www-data:www-data /var/www/backend \
 && chmod -R ug+rwx storage bootstrap/cache

COPY backend/docker/entrypoint.sh /usr/local/bin/app-entrypoint
COPY backend/docker/run-queue.sh /usr/local/bin/run-queue
COPY backend/docker/run-scheduler.sh /usr/local/bin/run-scheduler

RUN chmod +x /usr/local/bin/app-entrypoint /usr/local/bin/run-queue /usr/local/bin/run-scheduler

EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD php artisan app:healthcheck >/dev/null || exit 1
ENTRYPOINT ["app-entrypoint"]
CMD ["php-fpm", "-F"]
