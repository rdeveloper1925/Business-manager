# syntax=docker/dockerfile:1.7
# -----------------------------------------------------------------------------
# Build-time base images (must appear before any FROM — Docker ARG/FROM rules).
# Compose can override these via build.args (e.g. mirror.gcr.io/...).
# -----------------------------------------------------------------------------
# Image used for Composer + PHP extension compile + app copy (CLI only; smaller than FPM/Apache).
ARG PHP_BUILD_IMAGE=php:8.4-cli
# Image used for the final runnable container (Apache serves HTTP + mod_php runs PHP).
ARG PHP_RUNTIME_IMAGE=php:8.4-apache

# -----------------------------------------------------------------------------
# Stage: php-extensions — apt + compile PHP extensions (rarely changes).
# -----------------------------------------------------------------------------
FROM ${PHP_BUILD_IMAGE} AS php-extensions

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    libonig-dev \
    libssl-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libicu-dev \
    libzip-dev \
    && docker-php-ext-install -j"$(nproc)" \
    intl \
    zip \
    bcmath \
    soap \
    pcntl \
    && apt-get autoremove -y && apt-get clean && rm -rf /tmp/* /var/tmp/*

WORKDIR /var/www

# -----------------------------------------------------------------------------
# Stage: composer-deps — vendor from lockfile only (cached when app code changes).
# -----------------------------------------------------------------------------
FROM php-extensions AS composer-deps

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY composer.json composer.lock ./

RUN --mount=type=cache,target=/root/.composer/cache,sharing=locked \
    composer install --no-dev --no-scripts --optimize-autoloader --prefer-dist --no-interaction --no-progress

# -----------------------------------------------------------------------------
# Stage: builder — full tree + autoload / package:discover (needs APP_KEY).
# -----------------------------------------------------------------------------
FROM composer-deps AS builder

COPY . /var/www

# Laravel package:discover needs a valid APP_KEY; remove throwaway .env before runtime image.
RUN cp .env.example .env \
    && php -r '$k = base64_encode(random_bytes(32)); $e = file_get_contents(".env"); $e = preg_replace("/^APP_KEY=.*/m", "APP_KEY=base64:".$k, $e); file_put_contents(".env", $e);' \
    && composer dump-autoload --optimize --classmap-authoritative --no-interaction \
    && php artisan package:discover --ansi \
    && rm -f .env

# -----------------------------------------------------------------------------
# Stage: assets — npm ci cached on package*.json changes only; then full COPY + Vite build.
# -----------------------------------------------------------------------------
FROM composer-deps AS assets

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && rm -rf /tmp/* /var/tmp/*

WORKDIR /var/www

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-progress

COPY . /var/www

# Match builder: Wayfinder/Vite invoke `php artisan wayfinder:generate`, which needs a bootstrapped app
# (autoload + package discovery). This stage forks from composer-deps, not builder, so run these here.
RUN cp .env.example .env \
    && php -r '$k = base64_encode(random_bytes(32)); $e = file_get_contents(".env"); $e = preg_replace("/^APP_KEY=.*/m", "APP_KEY=base64:".$k, $e); file_put_contents(".env", $e);' \
    && composer dump-autoload --optimize --classmap-authoritative --no-interaction \
    && php artisan package:discover --ansi \
    && npm run build \
    && rm -f .env

# -----------------------------------------------------------------------------
# Stage: production — minimal runtime: Apache, copied extensions, app, compiled assets.
# -----------------------------------------------------------------------------
FROM ${PHP_RUNTIME_IMAGE} AS production

# Runtime libs for intl/zip/pgsql (Debian 13 trixie: libicu76, libzip5 — match official php:8.4-apache base).
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    libicu76 \
    libzip5 \
    libpq5 \
    nano \
    procps \
    curl \
    && apt-get autoremove -y && apt-get clean && rm -rf /tmp/* /var/tmp/*

COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY ./docker/apache-healthcheck.sh /usr/local/bin/apache-healthcheck.sh
RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/apache-healthcheck.sh

COPY ./docker/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY ./docker/servername.conf /etc/apache2/conf-available/servername.conf
RUN a2enmod rewrite && a2enconf -q servername

COPY ./storage /var/www/storage-init

# Reuse compiled PHP extensions from the CLI builder (intl, zip, etc.). PostgreSQL drivers are
# installed below on this Apache image so .so modules match mod_php (avoid copying CLI-built pgsql).
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
COPY --from=builder /usr/local/bin/docker-php-ext-* /usr/local/bin/

# Build pdo_pgsql + pgsql against this image's PHP/Apache SAPI (not copied from php:8.4-cli).
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql \
    && apt-get purge -y libpq-dev \
    && apt-get autoremove -y && apt-get clean && rm -rf /tmp/* /var/tmp/*

# Use production php.ini defaults (opcache, error display, etc.).
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Application code from builder (vendor, app, resources, public without fresh build dir yet).
COPY --from=builder /var/www /var/www

# Overlay compiled Vite assets into public/build (serve from image; avoid a named volume here).
COPY --from=assets /var/www/public/build /var/www/public/build

WORKDIR /var/www

# Apache workers run as www-data; align tree ownership for writable storage/bootstrap/cache.
RUN chown -R www-data:www-data /var/www

# Always run entrypoint first (migrations, config:cache, route:cache), then process from CMD.
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Local Compose maps APP_PORT:80; Railway injects PORT — entrypoint retargets Apache to PORT.
EXPOSE 80

# Hit whatever port Apache is bound to (PORT at runtime on Railway, else 80).
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD /usr/local/bin/apache-healthcheck.sh

# Default process after entrypoint: Apache in foreground (PID 1) so Docker tracks the server lifecycle.
CMD ["apache2-foreground"]