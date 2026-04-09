#!/bin/sh
set -e

# Initialize storage directory if empty
# -----------------------------------------------------------
# If the storage directory is empty, copy the initial contents
# and set the correct permissions.
# -----------------------------------------------------------
if [ ! "$(ls -A /var/www/storage 2>/dev/null)" ]; then
    echo "Initializing storage directory..."
    cp -R /var/www/storage-init/. /var/www/storage
fi

# Apache mod_php runs as www-data. Named volumes may already contain root-owned files
# from older entrypoints that ran artisan as root—fix ownership every boot.
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Remove storage-init directory
rm -rf /var/www/storage-init

# Run Laravel migrations
# -----------------------------------------------------------
# Ensure the database schema is up to date.
# Run artisan as www-data so laravel.log and bootstrap/cache files are writable by Apache.
# Bold + reverse video so this stands out in docker compose logs / plain terminals.
# -----------------------------------------------------------
printf '\n\033[1;7m================================================================\033[0m\n'
printf '\033[1;7m  >>>  LARAVEL DATABASE MIGRATIONS - STARTING NOW  <<<\033[0m\n'
printf '\033[1;7m================================================================\033[0m\n\n'

if ! su -s /bin/sh www-data -c "cd /var/www && php artisan migrate --force -v"; then
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
su -s /bin/sh www-data -c "cd /var/www && php artisan config:cache"
su -s /bin/sh www-data -c "cd /var/www && php artisan route:cache"

# Run the default command
exec "$@"
