# -----------------------------------------------------------------------------
# Build-time base images (must appear before any FROM — Docker ARG/FROM rules).
# Compose can override these via build.args (e.g. mirror.gcr.io/...).
# -----------------------------------------------------------------------------
# Image used for Composer + PHP extension compile + app copy (CLI only; smaller than FPM/Apache).
ARG PHP_BUILD_IMAGE=php:8.4-cli
# Image used for the final runnable container (Apache serves HTTP + mod_php runs PHP).
ARG PHP_RUNTIME_IMAGE=php:8.4-apache

# -----------------------------------------------------------------------------
# Stage: builder — install PHP extensions, Composer deps, full app tree.
# -----------------------------------------------------------------------------
FROM ${PHP_BUILD_IMAGE} AS builder

# Refresh apt indexes; install build deps for docker-php-ext-install / pecl; compile extensions;
# enable redis; remove build-only cruft to keep layer smaller.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    libonig-dev \
    libssl-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libicu-dev \
    libzip-dev \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    intl \
    zip \
    bcmath \
    soap \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get autoremove -y && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# curl / unzip — tooling for Composer installer and archives.
# libonig-dev — mbstring/oniguruma (often pulled indirectly; explicit for clarity).
# libssl-dev, libxml2-dev, libcurl4-openssl-dev — common PHP extension build deps.
# libicu-dev — intl extension.
# libzip-dev — zip extension.
# docker-php-ext-install … — official helper to compile and enable listed PHP extensions.
# -j$(nproc) — parallel compile jobs matching CPU count.
# pdo_mysql — Laravel database driver for MySQL.
# pecl install redis + docker-php-ext-enable redis — Redis PHP extension for cache/queue/session.

# Default working directory for subsequent COPY/RUN (Laravel root).
WORKDIR /var/www

# Copy the whole project so composer scripts can run artisan / discover packages.
COPY . /var/www

# Laravel's package:discover needs a valid APP_KEY during composer install.
RUN cp .env.example .env \
    && php -r '$k = base64_encode(random_bytes(32)); $e = file_get_contents(".env"); $e = preg_replace("/^APP_KEY=.*/m", "APP_KEY=base64:".$k, $e); file_put_contents(".env", $e);'

# Download Composer installer to /usr/local/bin/composer; install prod-only deps with optimized autoloader.
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && composer install --no-dev --optimize-autoloader --no-interaction --no-progress --prefer-dist

# Remove throwaway .env so runtime image does not bake in a fake key (real env comes from Compose/.env).
RUN rm -f .env

# -----------------------------------------------------------------------------
# Stage: assets — extends builder; adds Node and produces Vite build output under public/build.
# -----------------------------------------------------------------------------
FROM builder AS assets

# Install Node 22 from NodeSource so npm run build matches a modern toolchain; then remove apt lists.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

# Same temporary APP_KEY trick so artisan/wayfinder can run during vite build.
RUN cp .env.example .env \
    && php -r '$k = base64_encode(random_bytes(32)); $e = file_get_contents(".env"); $e = preg_replace("/^APP_KEY=.*/m", "APP_KEY=base64:".$k, $e); file_put_contents(".env", $e);'

# Install JS deps from lockfile; compile frontend (and Wayfinder); delete temp .env again.
RUN npm ci && npm run build && rm -f .env

# -----------------------------------------------------------------------------
# Stage: production — minimal runtime: Apache, copied extensions, app, compiled assets.
# -----------------------------------------------------------------------------
FROM ${PHP_RUNTIME_IMAGE} AS production

# Runtime libraries matching extensions (icu, zip); nano/procps for debugging; curl for healthcheck;
# same cleanup pattern as builder.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libicu-dev \
    libzip-dev \
    nano \
    procps \
    curl \
    && apt-get autoremove -y && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# libicu-dev / libzip-dev — runtime pieces intl/zip extensions expect at load time.
# nano — small editor for in-container debugging.
# procps — ps/top for process inspection.
# curl — HEALTHCHECK hits localhost; also handy for manual checks.

# Ship startup script (migrations, Laravel caches, then exec CMD).
COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Apache vhost: DocumentRoot public/, AllowOverride for Laravel .htaccess.
COPY ./docker/000-default.conf /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite

# Seed copy of storage skeleton; entrypoint copies into volume if /var/www/storage is empty.
COPY ./storage /var/www/storage-init

# Reuse compiled PHP extensions and their conf.d snippets from builder (same PHP major.minor).
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
COPY --from=builder /usr/local/bin/docker-php-ext-* /usr/local/bin/

# Use production php.ini defaults (opcache, error display, etc.).
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Application code from builder (vendor, app, resources, public without fresh build dir yet).
COPY --from=builder /var/www /var/www

# Overlay compiled Vite assets into public/build (volume in Compose can override at runtime).
COPY --from=assets /var/www/public/build /var/www/public/build

WORKDIR /var/www

# Apache workers run as www-data; align tree ownership for writable storage/bootstrap/cache.
RUN chown -R www-data:www-data /var/www

# Always run entrypoint first (migrations, config:cache, route:cache), then process from CMD.
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Document that the container listens on HTTP port 80 (Compose maps APP_PORT:80).
EXPOSE 80

# Mark unhealthy if the app does not respond over HTTP inside the container.
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD curl -fsS http://127.0.0.1/ >/dev/null || exit 1

# Default process after entrypoint: Apache in foreground (PID 1) so Docker tracks the server lifecycle.
CMD ["apache2-foreground"]
