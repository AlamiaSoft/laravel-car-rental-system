---
name: alamia-vps-deployment
description: >-
  Standard operating procedure for deploying containerized web applications on the Alamia Hetzner CX43 VPS
  using Portainer Stacks, the shared alamia-network, and Cloudflare Zero Trust Tunnels.
---

# Alamia VPS Deployment Skill (`alamiaai.com` Stack)

This skill prescribes the exact deployment architecture and conventions for hosting applications on the Alamia Hetzner VPS using Docker, Portainer, and Cloudflare Tunnels.

---

## 1. Core Architectural Rules

### Rule 1: Always Use the Shared External Network (`alamia-network`)
All stacks must attach to the pre-existing external Docker bridge network:
```yaml
networks:
  alamia-network:
    external: true
```
Every service (`app`, `worker`, `cron`, `reverb`, `db`, `redis`) must specify:
```yaml
    networks:
      - alamia-network
```

### Rule 2: App Host Port Publishing & Loopback Binding (`127.0.0.1`)
- **`app` container**: Must publish to a dedicated, unassigned host port bound **exclusively to localhost (`127.0.0.1`)**:
  ```yaml
  ports:
    - "127.0.0.1:${APP_PORT:-8005}:80"
  ```
  > [!IMPORTANT]
  > Never bind to `0.0.0.0` (e.g. `"${APP_PORT:-8005}:80"`). Docker bypasses Linux UFW firewalls by default. Binding to `0.0.0.0` allows attackers to bypass Cloudflare WAF, rate limits, and DDoS protection by connecting directly to `http://<vps-ip>:8005`.
- **Auxiliary services (`db`, `redis`, `reverb`, `worker`, `cron`)**: **NEVER** bind host ports (`8080`, `5432`, `6379`). Internal communication resolves automatically over `alamia-network` via Docker DNS (`db:5432`, `redis:6379`).

### Rule 3: Cloudflare Tunnel Routing
- In the Cloudflare Zero Trust Dashboard, public hostnames route to the published port on loopback:
  - **Service Type**: `HTTP`
  - **URL**: `localhost:8005` (Matches the Portainer published port).

---

## 2. Dockerfile Build Pipeline

### Multi-Stage Build with Peer Dependencies Fix
To ensure reliable builds on Alpine and Debian images:
1. **PHP Composer Builder Stage**: Installs composer dependencies with `--no-dev --optimize-autoloader`.
2. **Node.js Builder Stage**:
   - Must copy both `package*.json` AND `.npmrc`.
   - Ensure `.npmrc` contains `legacy-peer-deps=true` (or pass `--legacy-peer-deps` to `npm install`) to prevent `ERESOLVE` peer dependency build errors.
   - Run `npm run build` to generate `public/build`.
3. **Final Production Stage**:
   - Base image: `webdevops/php-nginx:8.3-alpine`.
   - Copy built PHP vendor and frontend assets (`public/build`) from the respective builder stages.
   - Run `php artisan storage:link`.

---

## 3. Zero-Touch Container Startup (`docker-entrypoint.sh`)

Do not require manual SSH or console commands to initialize applications. Always include an entrypoint script:

```bash
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
```

Make it executable in the Dockerfile:
```dockerfile
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
```

---

## 4. Volume & Asset Persistence (With Path Traversal Protection)

Uploaded assets (branding logos, vehicle photos, customer documents) must persist across container updates:
- Define a dedicated volume (e.g., `storage-data:`).
- Mount it across `app`, `worker`, and `cron` services:
  ```yaml
  volumes:
    - storage-data:/app/storage
  ```
- In Laravel `routes/web.php`, fallback routes `/storage/{path}` must include strict path traversal protection using `realpath()` and `str_starts_with()`:
  ```php
  Route::get('/storage/{path}', function (string $path) {
      $basePath = realpath(storage_path('app/public'));
      if (! $basePath) {
          abort(404);
      }

      $filePath = realpath($basePath . DIRECTORY_SEPARATOR . $path);

      if (! $filePath || ! str_starts_with($filePath, $basePath) || ! is_file($filePath)) {
          abort(404);
      }

      return response()->file($filePath);
  })->where('path', '.*')->name('storage.public.serve');
  ```

---

## 5. Reverse Proxy & Client IP Trust (`bootstrap/app.php`)

Because Cloudflare Tunnel terminates SSL at the edge and proxies HTTP internally, Laravel must be configured to trust upstream reverse proxies:
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(at: '*');
})
```
This ensures:
- `CF-Connecting-IP` / `X-Forwarded-For` is resolved so rate limiters (`throttle:`) track individual client IPs rather than throttling the entire server.
- HTTPS redirects and asset URL generation do not get trapped in HTTP downgrade loops.

---

## 6. Portainer Stack Deployment Checklist

When deploying a new stack in Portainer:
1. **Repository Method**: Enter GitHub repository URL, branch (`refs/heads/main`), and compose path (`docker-compose.yml`).
2. **Environment Variables**: Use **Advanced Mode** to paste the complete `.env` configuration (matching `deploy_hetzner.md`).
3. **Deploy the Stack**: Portainer pulls code, builds image via Dockerfile, and boots containers.
4. **Cloudflare Tunnel Routing**: Add the public hostname in Zero Trust pointing to `localhost:8005`.

