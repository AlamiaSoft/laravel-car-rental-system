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
APP_NAME=OrmEasy
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ormeasy-car.alamiaai.com
APP_KEY=base64:LM66X++eqZ6V1i5aG+geUI0Uq4/wfDQzIt4PLdfF91c=

# Database configuration
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=carrental_os
DB_USERNAME=carrental
DB_PASSWORD=postgression2026

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
GOOGLE_CLIENT_ID=ADD_HERE
GOOGLE_CLIENT_SECRET=ADD_HERE
GOOGLE_REDIRECT_URL=https://ormeasy-car.alamiaai.com/auth/google/callback

FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
FACEBOOK_REDIRECT_URL=https://ormeasy-car.alamiaai.com/auth/facebook/callback

# Evolution API
EVOLUTION_API_URL=https://evoapi.alamiaai.com
EVOLUTION_API_KEY=SOMEONE_XANGED_MES_TO_A_LONGLONGLONG_RANDOM_SECRETSS
EVOLUTION_WEBHOOK_URL=https://ormeasy-car.alamiaai.com/api/webhooks/evolution
```

6. Click **Deploy the stack**. Portainer will pull the repository, build the images based on the `Dockerfile` (which includes Node.js compilation), and start the containers.

## 2. Initialize the Application
Once the stack is deployed, the `app` container will automatically run the database migrations and seeders on startup via the `docker-entrypoint.sh` script.

You don't need to manually run any shell commands! Just wait a few seconds for the database to boot and the migrations to complete.

## 3. Setup Cloudflare Tunnel
In your Cloudflare Zero Trust Dashboard, configure the public hostname `ormeasy-car.alamiaai.com`:
- **Service Type**: `HTTP`
- **URL**: `localhost:8005` (Matches the published port visible on `ormeasy-car-app-1` in Portainer)

## 4. Verify Deployment
Navigate to `https://ormeasy-car.alamiaai.com` in your browser.
1. Check that the login screen loads correctly.
2. Log in using a seeded user (e.g. `prime-rentals` credentials) or register a new tenant.
3. Upload a logo in the Mini App Settings and verify that the logo image loads without a 403 error.
4. Go to the CRM Dashboard to verify your seeded data appears properly.
