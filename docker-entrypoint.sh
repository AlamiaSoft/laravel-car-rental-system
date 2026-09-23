#!/bin/sh
set -e

# If a custom command is passed (worker, cron, reverb, etc.), execute it directly
if [ "$#" -gt 0 ] && [ "$1" != "supervisord" ] && [ "$1" != "/entrypoint" ]; then
    echo "Executing custom container command: $@"
    exec "$@"
fi

echo "Ensuring storage and cache directory structure..."
mkdir -p /app/storage/framework/cache/data \
         /app/storage/framework/sessions \
         /app/storage/framework/views \
         /app/storage/logs \
         /app/storage/app/public \
         /app/bootstrap/cache

touch /app/storage/logs/laravel.log

echo "Linking public storage..."
php artisan storage:link --force || true

echo "Clearing cached configurations..."
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

echo "Waiting for database to be ready and running migrations..."
RETRIES=15
until php artisan migrate --force || [ $RETRIES -eq 0 ]; do
  echo "Waiting for database server, $((RETRIES--)) remaining attempts..."
  sleep 3
done

if [ $RETRIES -gt 0 ]; then
  echo "Running database seeders..."
  php artisan db:seed --class=RolesAndPermissionsSeeder --force || true
  php artisan db:seed --class=CarRentalSeeder --force || true
fi

echo "Applying final storage and bootstrap cache permissions for php-fpm..."
chown -R application:application /app/storage /app/bootstrap/cache
chmod -R 775 /app/storage /app/bootstrap/cache
chmod 664 /app/storage/logs/laravel.log || true

echo "Starting application supervisor..."
exec /entrypoint supervisord
