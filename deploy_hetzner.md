# Hetzner VPS Deployment Guide with Portainer and Cloudflare Tunnel

This guide walks you through deploying the Car Rental OS on your Hetzner CX43 VPS using Portainer Stacks (pulling directly from GitHub) and Cloudflare Tunnels.

## Prerequisites
- Hetzner CX43 VPS with Docker and Portainer installed.
- A Cloudflare account with a domain configured.
- The `laravel-car-rental-system` codebase pushed to your GitHub repository.

## 1. Deploy via Portainer Stacks
Since your workflow relies on Portainer pulling directly from GitHub, you will set up the stack through the Portainer UI.

1. Log in to your **Portainer Dashboard** on the VPS.
2. Navigate to **Stacks** and click **Add stack**.
3. Select the **Repository** build method.
4. Fill in the repository details:
   - **Repository URL**: `https://github.com/<your-username>/<your-repo>` (Include authentication if the repo is private).
   - **Repository reference**: `refs/heads/main` (or your default branch).
   - **Compose path**: `docker-compose.yml` (make sure it points to the correct path in the repo).
5. Under **Environment variables**, click **Advanced mode** and paste in the essential production variables:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ormeasy-car.alamiaconnect.com
APP_KEY=

# Database configuration
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=carrental_os
DB_USERNAME=carrental
DB_PASSWORD=YourStrongDatabasePassword123

# Redis / Queue configuration
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# Reverb (WebSockets) configuration
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=my-reverb-app
REVERB_APP_KEY=my-reverb-key
REVERB_APP_SECRET=my-reverb-secret
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=http

# OAuth (Google & Facebook)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URL=https://ormeasy-car.alamiaconnect.com/auth/google/callback

FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
FACEBOOK_REDIRECT_URL=https://ormeasy-car.alamiaconnect.com/auth/facebook/callback

# Evolution API
EVOLUTION_API_URL=https://evoapi.alamiaai.com
EVOLUTION_API_KEY=your-api-key
EVOLUTION_WEBHOOK_URL=https://ormeasy-car.alamiaconnect.com/api/webhooks/evolution
```

6. Click **Deploy the stack**. Portainer will pull the repository, build the images based on the `Dockerfile` (which includes Node.js compilation), and start the containers.

## 2. Initialize the Application
Once the stack is deployed, the `app` container will automatically run the database migrations and seeders on startup via the `docker-entrypoint.sh` script.

You don't need to manually run any shell commands! Just wait a few seconds for the database to boot and the migrations to complete.

## 3. Setup Cloudflare Tunnel
Since you mentioned using Cloudflare Tunnels for exposing `ormeasy-car.alamiaconnect.com`, you don't need to open port 80/443 on your Hetzner firewall.

1. **Install Cloudflared on Hetzner VPS**:
   Follow Cloudflare's instructions in the Zero Trust dashboard to create a new tunnel and install the daemon on your VPS.

2. **Configure the Tunnel**:
   In the Cloudflare Zero Trust Dashboard, route your hostname `ormeasy-car.alamiaconnect.com` to the local Docker application.
   - **Service Type**: `HTTP`
   - **URL**: `localhost:8000` (Because our `docker-compose.yml` maps port 8000 on the host to port 80 in the app container)
   
3. **Save and wait for DNS to propagate.**

## 4. Verify Deployment
Navigate to `https://ormeasy-car.alamiaconnect.com` in your browser.
1. Check that the login screen loads correctly.
2. Log in using a seeded user (e.g. `prime-rentals` credentials) or register a new tenant.
3. Upload a logo in the Mini App Settings and verify that the logo image loads without a 403 error.
4. Go to the CRM Dashboard to verify your seeded data appears properly.
