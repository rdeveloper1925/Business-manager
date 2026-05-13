#!/bin/sh
set -e

# Ensure expected Laravel storage paths exist (named volumes start empty or partial).
ensure_storage_layout() {
    mkdir -p \
        /var/www/storage/logs \
        /var/www/storage/framework/cache/data \
        /var/www/storage/framework/sessions \
        /var/www/storage/framework/views \
        /var/www/storage/framework/testing \
        /var/www/storage/app/public \
        /var/www/storage/app/private
}

# Apache mod_php runs as www-data. Volumes are often root:root with mode 755, so www-data
# cannot create laravel.log under storage/logs — fix ownership and group/user write bits.
fix_app_writables() {
    ensure_storage_layout
    chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
    chmod -R ug+rwX /var/www/storage /var/www/bootstrap/cache
}

# Prefer runuser (avoids PAM/tty edge cases with su in minimal/container setups).
run_as_www_data() {
    _cmd=$1
    if command -v runuser >/dev/null 2>&1; then
        runuser -u www-data -- env HOME=/var/www "APP_KEY=${APP_KEY}" sh -c "cd /var/www && ${_cmd}"
    else
        env HOME=/var/www "APP_KEY=${APP_KEY}" su -s /bin/sh www-data -c "cd /var/www && ${_cmd}"
    fi
}

# `php artisan key:generate` boots Laravel and fails if APP_KEY is missing; generate out-of-band.
ensure_app_key() {
    if [ -z "${APP_KEY:-}" ]; then
        APP_KEY="$(php -r 'echo "base64:".base64_encode(random_bytes(32));')"
        export APP_KEY
        printf '%s\n' 'entrypoint: APP_KEY was empty; generated a random key for this container.'
    fi
}

# Initialize storage directory if empty
# -----------------------------------------------------------
# If the storage directory is empty, copy the initial contents from the image.
# -----------------------------------------------------------
ensure_storage_layout

if [ ! "$(ls -A /var/www/storage 2>/dev/null)" ]; then
    echo "Initializing storage directory..."
    cp -R /var/www/storage-init/. /var/www/storage
fi

fix_app_writables

# Remove storage-init directory
rm -rf /var/www/storage-init

ensure_app_key

# Reverb / one-off workers: do not run migrations or config/route cache here.
# Running those concurrently from app + queue + reverb causes DB lock contention and
# bootstrap/cache races (intermittent container failures).
if [ "${LARAVEL_CONTAINER_ROLE:-}" = "reverb" ]; then
    exec "$@"
fi

# Run Laravel migrations
# -----------------------------------------------------------
# Run artisan as www-data so new files under storage/ stay owned by Apache's user.
# Bold + reverse video so this stands out in docker compose logs / plain terminals.
# -----------------------------------------------------------
printf '\n\033[1;7m================================================================\033[0m\n'
printf '\033[1;7m  >>>  LARAVEL DATABASE MIGRATIONS - STARTING NOW  <<<\033[0m\n'
printf '\033[1;7m================================================================\033[0m\n\n'

if ! run_as_www_data "php artisan migrate --force -v"; then
    printf '\n\033[1;7m================================================================\033[0m\n'
    printf '\033[1;7m  >>>  MIGRATIONS FAILED - SEE OUTPUT ABOVE  <<<\033[0m\n'
    printf '\033[1;7m================================================================\033[0m\n\n'
    exit 1
fi

printf '\n\033[1;7m================================================================\033[0m\n'
printf '\033[1;7m  >>>  MIGRATIONS FINISHED SUCCESSFULLY  <<<\033[0m\n'
printf '\033[1;7m================================================================\033[0m\n\n'

# Clear and cache optimized artifacts
# -----------------------------------------------------------
# Improves performance by caching config, routes, events, and views.
# -----------------------------------------------------------
run_as_www_data "php artisan optimize"
run_as_www_data "php artisan storage:link --force"

# Last pass before Apache: any root-owned files or tight umasks from prior boots.
fix_app_writables
touch /var/www/storage/logs/laravel.log
chown www-data:www-data /var/www/storage/logs/laravel.log
chmod 664 /var/www/storage/logs/laravel.log

# Railway and similar platforms set PORT; the edge proxy forwards to that port inside the
# container. Apache defaults to :80 only — align Listen + VirtualHost with PORT (default 80).
configure_apache_http_port() {
    APACHE_HTTP_PORT="${PORT:-80}"
    export APACHE_HTTP_PORT
    if [ -f /etc/apache2/ports.conf ]; then
        sed -i "s/^Listen 80\$/Listen ${APACHE_HTTP_PORT}/" /etc/apache2/ports.conf
    fi
    if [ -f /etc/apache2/sites-available/000-default.conf ]; then
        sed -i "s/<VirtualHost \\*:80>/<VirtualHost *:${APACHE_HTTP_PORT}>/" /etc/apache2/sites-available/000-default.conf
    fi
}

# Bold + reverse video: where the web app is bound and what Laravel thinks the URL is.
# Only the Apache foreground process serves HTTP; queue/reverb use the same image with other CMDs.
if [ "${1:-}" = "apache2-foreground" ]; then
    configure_apache_http_port
    printf '\n\033[1;7m================================================================\033[0m\n'
    printf '\033[1;7m  >>>  APPLICATION HTTP ENDPOINT  <<<\033[0m\n'
    printf '\033[1;7m================================================================\033[0m\n'
    printf '\033[1m  Configured application URL (APP_URL):\033[0m %s\n' "${APP_URL:-<not set>}"
    printf '\033[1m  HTTP listen port (inside this container):\033[0m %s (from PORT, default 80)\n' "${APACHE_HTTP_PORT}"
    if [ -n "${APP_PORT:-}" ]; then
        printf '\033[1m  Docker published host port (APP_PORT):\033[0m %s\n' "${APP_PORT}"
    fi
    printf '\033[1;7m================================================================\033[0m\n\n'
fi

# Run the default command
exec "$@"
