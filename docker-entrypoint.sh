#!/bin/sh
set -e

echo "Running Laravel Migrations & Seeders..."
# We use a simple loop to wait for the database to be ready
RETRIES=10
until php artisan migrate --force || [ $RETRIES -eq 0 ]; do
  echo "Waiting for database server, $((RETRIES--)) remaining attempts..."
  sleep 3
done

if [ $RETRIES -gt 0 ]; then
    echo "Running Seeders..."
    php artisan db:seed --class=CarRentalSeeder --force || true
fi

echo "Starting original entrypoint..."
# The webdevops image uses /entrypoint as the main entrypoint
exec /entrypoint supervisord
