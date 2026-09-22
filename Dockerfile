# Stage 1: Build PHP dependencies
FROM composer:2.7 AS composer-builder
WORKDIR /app
COPY . .
RUN composer install --optimize-autoloader --no-dev --no-interaction --no-progress --ignore-platform-reqs

# Stage 2: Build Node dependencies
FROM node:20-alpine AS node-builder
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build


# Stage 3: Final Production Image
FROM webdevops/php-nginx:8.3-alpine

# Install essential PHP extensions
RUN apk add --no-cache \
    php83-exif \
    php83-gd \
    php83-intl \
    php83-fileinfo \
    php83-zip \
    php83-bcmath

# Set environment variables for the container
ENV WEB_DOCUMENT_ROOT=/app/public
ENV PHP_DATE_TIMEZONE="UTC"

WORKDIR /app

# Copy built application from previous stages
COPY --from=composer-builder --chown=application:application /app /app
COPY --from=node-builder --chown=application:application /app/public/build /app/public/build

# Ensure storage and bootstrap cache directories are writable
RUN chmod -R 775 /app/storage /app/bootstrap/cache

# Create storage link for public assets
RUN php artisan storage:link

# Copy custom entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]


