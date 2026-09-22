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

### Rule 2: App Host Port Publishing & Avoiding Collisions
- **`app` container**: Must publish to a dedicated, unassigned host port (e.g. `"${APP_PORT:-8005}:80"`) so it is prominently visible in the Portainer Containers UI table under **Published Ports**. Avoid standard busy ports like `80` or `8000`.
- **Auxiliary services (`db`, `redis`, `reverb`, `worker`, `cron`)**: **NEVER** bind host ports (`8080`, `5432`, `6379`). Internal communication between `app`, `worker`, `db`, and `redis` resolves automatically over `alamia-network` via Docker DNS (`db:5432`, `redis:6379`).

### Rule 3: Cloudflare Tunnel Routing
- In the Cloudflare Zero Trust Dashboard, public hostnames route to the published port on the host:
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

echo "Waiting for database to be ready..."
RETRIES=15
until php artisan migrate --force || [ $RETRIES -eq 0 ]; do
  echo "Waiting for database server, $((RETRIES--)) remaining attempts..."
  sleep 3
done

if [ $RETRIES -gt 0 ]; then
  echo "Running database seeders..."
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

## 4. Volume & Asset Persistence

Uploaded assets (branding logos, vehicle photos, customer documents) must persist across container updates:
- Define a dedicated volume (e.g., `storage-data:`).
- Mount it across `app`, `worker`, and `cron` services:
  ```yaml
  volumes:
    - storage-data:/app/storage
  ```
- In Laravel `routes/web.php`, always provide a fallback route `/storage/{path}` to stream files from `storage/app/public` so missing or broken symlinks in container volumes never cause `403 Forbidden` errors.

---

## 5. Portainer Stack Deployment Checklist

When deploying a new stack in Portainer:
1. **Repository Method**: Enter GitHub repository URL, branch (`refs/heads/main`), and compose path (`docker-compose.yml`).
2. **Environment Variables**: Use **Advanced Mode** to paste the complete `.env` configuration (matching `deploy_hetzner.md`).
3. **Deploy the Stack**: Portainer pulls code, builds image via Dockerfile, and boots containers.
4. **Cloudflare Tunnel Routing**: Add the public hostname in Zero Trust pointing to `http://<stack_name>-app-1:80`.
