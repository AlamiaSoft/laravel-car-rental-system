#!/bin/sh
set -e

echo "Ensuring storage and cache directory permissions..."
mkdir -p /app/storage/framework/cache/data \
         /app/storage/framework/sessions \
         /app/storage/framework/views \
         /app/storage/logs \
         /app/storage/app/public \
         /app/bootstrap/cache

chown -R application:application /app/storage /app/bootstrap/cache
chmod -R 775 /app/storage /app/bootstrap/cache

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

echo "Starting application supervisor..."
exec /entrypoint supervisord
