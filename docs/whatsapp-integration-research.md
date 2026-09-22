# R&D: WhatsApp Business Integration using `kstmostofa/laravel-whatsapp`

## Overview of the Package
The `kstmostofa/laravel-whatsapp` package is a dual-backend integration for Laravel that supports both the **Meta Cloud API** (official WhatsApp Business API) and a **Web Sidecar** (unofficial `whatsapp-web.js` for personal numbers). 

### Suitability for our SaaS Use Case: **Highly Suitable (with caveats)**
This package is an excellent fit for our restaurant OS, provided we use it correctly within our multi-tenant architecture. 

**Pros:**
1. **Cloud API Support:** Uses pure PHP HTTP requests to interface with Meta's official API, which is highly scalable and lightweight.
2. **Unified Facade:** Provides a clean `WhatsApp::messages()->sendTemplate(...)` API which makes code readable and maintainable.
3. **Livewire UI:** Includes a polished UI that could be customized or used for internal admin debugging.

**Cons / Architectural Challenges:**
1. **Node.js Sidecar Overheads:** The "Web sidecar" feature spins up a headless Chrome instance (`whatsapp-web.js`) to pair personal numbers via QR code. **We should strictly avoid using the sidecar in production for our tenants.** Running a Chrome browser instance for every single restaurant tenant will consume massive amounts of server RAM and crash our infrastructure. We must strictly mandate the **Meta Cloud API** for tenants.
2. **Configuration Architecture:** The package relies on `.env` variables (e.g., `WHATSAPP_ACCESS_TOKEN`). In a multi-tenant environment (`stancl/tenancy`), we cannot rely on a single `.env` file. We must dynamically swap the configuration at runtime based on the active tenant.

---

## Multi-Tenant Implementation Strategy

### 1. Database & Tenant Settings
We need to add a "WhatsApp Settings" section to the Tenant Dashboard. To support this, we should add the following columns to our `tenants` table (or a dedicated `tenant_settings` JSON column):

- `wa_phone_number_id`: The Meta Phone Number ID.
- `wa_business_account_id`: The Meta Business Account ID.
- `wa_access_token`: The permanent access token.

### 2. Dynamic Configuration (`stancl/tenancy`)
`stancl/tenancy` allows mapping tenant database columns to Laravel configuration keys automatically. We will configure the tenancy bootstrap process to bind the tenant's WhatsApp credentials to the package's config at runtime.

When a tenant is initialized, the system will do this under the hood:
```php
Config::set('whatsapp.cloud.access_token', $tenant->wa_access_token);
Config::set('whatsapp.cloud.phone_number_id', $tenant->wa_phone_number_id);
```
This ensures the `WhatsApp::send()` facade always uses the correct restaurant's credentials.

### 3. Webhook Routing
WhatsApp Cloud API requires a **single webhook endpoint** per Meta App. 
When a user sends a message to *any* tenant's phone number, Meta will hit our central SaaS webhook `https://our-saas.com/api/whatsapp/webhook`.

The payload from Meta contains a `metadata.phone_number_id` field. We will use this field to identify the tenant, initialize the tenant context, and then process the bot logic:

```php
// Central Webhook Controller
$phoneNumberId = $request->input('entry.0.changes.0.value.metadata.phone_number_id');

// Find which restaurant owns this WhatsApp number
$tenant = Tenant::where('wa_phone_number_id', $phoneNumberId)->firstOrFail();

// Initialize Tenancy
tenancy()->initialize($tenant);

// Now process the message...
```

---

## Action Plan / Next Steps

If we proceed with this package, the execution plan will be:
1. Require `kstmostofa/laravel-whatsapp` via Composer.
2. Add the WhatsApp credential columns to the `tenants` migration.
3. Build a Livewire/Inertia settings page in the Tenant Dashboard allowing restaurant owners to input their `Phone Number ID` and `Access Token`.
4. Register the Tenancy config mappings so the package uses the active tenant's credentials.
5. Update our `BotController` webhook to accept Meta's format and route to the correct tenant based on the incoming `phone_number_id`.
