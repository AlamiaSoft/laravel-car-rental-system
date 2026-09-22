# System Architecture

## 1. Core Technical Stack
- **Backend Framework**: Laravel 13 (PHP 8.3)
- **Frontend Engine**: Inertia.js v2 + React 18 + TailwindCSS v3
- **Client Mini-App (Ordering)**: Progressive Web App (PWA) with offline-ready service worker & responsive mobile-first UI
- **Database**: PostgreSQL 16 / SQLite (Single-Database Multi-Tenancy mapped with `tenant_id` global scopes via `stancl/tenancy`)
- **Cache / Session / Queue**: Redis 7 + Laravel Horizon
- **Real-Time WebSockets**: Laravel Reverb (Pushing instant order updates & audio chimes to KDS)
- **WhatsApp Gateway**: Dual Provider (Evolution API Baileys connector + Meta Cloud API abstraction)
- **Infrastructure**: Docker Compose Stack (`app`, `worker`, `cron`, `reverb`, `db`, `redis`)

---

## 2. PWA Mini-App + WhatsApp Gateway Pattern

The platform decouples **traffic acquisition & notification** from the **commerce transaction layer**:

```text
                 CUSTOMER
                    │
              "Hi" on WhatsApp (or QR / Short Link /t/{token})
                    │
                    ▼
          WhatsApp Gateway (Evolution API / Meta Cloud)
                    │
                    ▼
          [1. UPSERT CRM Customer (Verified WhatsApp Phone)]
          [2. Generate 15-min Opaque Exchange Token]
                    │
                    ▼
         "Order from ABC Pizza 👇 [Signed Link /t/x8k2p9m1]"
                    │
                    ▼
          Token Exchange Endpoint (/t/{token})
          [3. Validate & Consume Token -> Set HttpOnly Session]
          [4. 302 Redirect -> Clean URL: /app/{slug}/order]
                    │
                    ▼
        ┌─────────────────────────┐
        │ Tenant PWA Mini-App     │
        │                         │
        │ 🍕 Interactive Visual Menu
        │ 🏷️ Variants, Sizes & Modifiers
        │ 🛒 Persistent Cart      │
        │ 📍 Map & Delivery Address
        │ 💳 Cash on Delivery / Online
        │ 📦 Live Status Tracking │
        └────────────┬────────────┘
                     │
                     ▼
          Laravel Multi-Tenant APIs (`/api/pwa/*`)
          [5. Update CRM Customer Profile & LTV]
          [6. Create Order & Broadcast to KDS via Reverb]
                     │
            ┌────────┼────────┐
            ▼        ▼        ▼
          CRM     Orders   Unified KDS / POS (Reverb)
                     │
                     ▼
          WhatsApp Transactional
          Milestone Alerts
```

### Architectural Roles:
1. **WhatsApp as Gateway**: Greets customer, immediately captures/upserts the verified WhatsApp phone number in the tenant's CRM database as an active lead, generates a 15-minute opaque exchange token, and delivers automated milestone alerts.
2. **PWA as Commerce Engine**: Consumes exchange token on first load, establishes a secure `HttpOnly` session, and presents a rich visual ordering experience on a clean URL.
3. **Laravel Multi-Tenant Core**: Centralizes "Customer Memory" (identity, addresses, order history, LTV), handles real-time KDS dispatching, and orchestrates transactional WhatsApp updates.

---

## 3. WhatsApp Bot Workflow Builder Architecture

The `Modules/Bot` module embeds a native **Schema-Driven Workflow Execution Engine**:

- **Execution Engine**: `Modules\Bot\Services\WorkflowExecutionEngine` interprets dynamic graph flows stored in `bot_workflows`.
- **Supported Node Types**:
  - `trigger`: Inbound keywords or message matching.
  - `message`: Text responses with template variables (`{{tenant.name}}`, `{{customer.name}}`, `{{pwa.url}}`).
  - `catalog_menu`: Dynamic Eloquent binding to tenant `Category` and `Product` models.
  - `pwa_link`: Generates opaque signed tokens for 1-click PWA Mini-App checkout.
  - `system_action`: Contextual state transitions or agent handoff.
- **Admin Visual Editor**: `/admin/bot-workflows` provides a step-by-step node builder with live WhatsApp bubble preview.

---

## 4. Merchant ROI Engine & Onboarding Stepper

- **Merchant ROI Service**: `app/Services/MerchantRoiService` calculates direct revenue, Average Order Value (AOV), repeat retention %, and estimated 3rd-party marketplace commission savings (vs. configurable aggregator benchmarks).
- **10-Minute Launch Stepper**: `app/Services/MerchantOnboardingService` tracks launch readiness across 5 key steps (Menu creation, WhatsApp connection, Branding, Delivery rules, KDS testing).
- **Checklist Preference Persistence**: Merchants can dismiss the checklist from the dashboard into hidden state, with a 1-click **Restore to Dashboard** option under **Settings > Ordering Rules**.

---

## 5. Security, Isolation & Reliability Layer

- **Tenant Isolation**: Protected via `stancl/tenancy` single-database global scopes with dedicated automated integration tests (`TenantIsolationSecurityTest.php`).
- **Queued WhatsApp Notifications**: `SendOrderStatusWhatsAppNotification` implements `ShouldQueue`, exponential backoff (`$tries = 3`), and idempotency cache locking.
- **Rate Limiting Hardening**: Explicit throttle limits for `throttle:pwa-checkout` (15/min), `throttle:bot-webhook` (120/min), and `throttle:api` (60/min).
