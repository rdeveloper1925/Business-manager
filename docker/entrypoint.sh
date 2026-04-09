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
    chown -R www-data:www-data /var/www/storage
fi

# Remove storage-init directory
rm -rf /var/www/storage-init

# Run Laravel migrations
# -----------------------------------------------------------
# Ensure the database schema is up to date.
# Bold + reverse video so this stands out in docker compose logs / plain terminals.
# -----------------------------------------------------------
printf '\n\033[1;7m================================================================\033[0m\n'
printf '\033[1;7m  >>>  LARAVEL DATABASE MIGRATIONS - STARTING NOW  <<<\033[0m\n'
printf '\033[1;7m================================================================\033[0m\n\n'

if ! php artisan migrate --force -v; then
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
php artisan config:cache
php artisan route:cache

# Run the default command
exec "$@"
