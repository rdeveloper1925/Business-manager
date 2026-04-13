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
        runuser -u www-data -- env HOME=/var/www sh -c "cd /var/www && ${_cmd}"
    else
        su -s /bin/sh www-data -c "cd /var/www && ${_cmd}"
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

# Clear and cache configurations
# -----------------------------------------------------------
# Improves performance by caching config and routes.
# -----------------------------------------------------------
run_as_www_data "php artisan config:cache"
run_as_www_data "php artisan route:cache"

# Last pass before Apache: any root-owned files or tight umasks from prior boots.
fix_app_writables
touch /var/www/storage/logs/laravel.log
chown www-data:www-data /var/www/storage/logs/laravel.log
chmod 664 /var/www/storage/logs/laravel.log

# Run the default command
exec "$@"
