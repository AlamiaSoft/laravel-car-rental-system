# Implementation Plan: Capability-Driven Multi-Vertical Platform (v4 — Final Approved)

## Background

Based on all four feedback rounds:
- [`feedback-on-current-architecture.md`](file:///f:/ai/Whatsapp-Order-bot/docs/RnD/adding-more-verticals/feedback-on-current-architecture.md) — capabilities as architecture, not `business_type` switches
- [`feedback-2.md`](file:///f:/ai/Whatsapp-Order-bot/docs/RnD/adding-more-verticals/feedback-2.md) — Services capability, backend enforcement, dependency graph, composable PWA
- [`feedback-3.md`](file:///f:/ai/Whatsapp-Order-bot/docs/RnD/adding-more-verticals/feedback-3.md) — CRM not in capabilities, Payments as infrastructure, Cart/Booking separation, safe DTO, experience priority
- **feedback-4 (inline)** — slug not tenant ID in URLs, validate `primary_experience`, single canonical enforcement layer, cycle detection in dependency resolver

> **Status: APPROVED for implementation.**

---

## Core Architecture: The Three-Layer Stack

```
Capabilities (backend truth)
       ↓
Experiences (resolved abstractions: Order, Book, Browse, Track)
       ↓
PWA Panels (composable React components: CatalogPanel, BookingPanel...)
```

The PWA never directly understands every capability. It understands **experiences** derived from capabilities. New capabilities never require PWA changes unless they introduce a new experience type.

---

## What CRM Is vs. Is Not

> **CRM is platform infrastructure — not a capability.**

CRM is universally available to every tenant, like the database itself. It is **never stored in `tenant_capabilities`** and never appears in the `TenantCapability` enum. There is no toggle for it. The Modules/Crm codebase is always available.

This avoids the question *"Can I disable CRM?"* from ever being answerable with *"yes."*

---

## Phase 1 — Capability Infrastructure

---

### 1A. Database

#### [NEW] Migration: `add_business_type_to_tenants_table`
- Adds `business_type` string column (default `'restaurant'`). Backward-compatible.

#### [NEW] Migration: `add_primary_experience_to_tenants_table`
- Adds `primary_experience` string column (nullable). Stores tenant-configurable primary experience key, e.g. `'ordering'` or `'booking'`. Falls back to capability registry priority when null.

#### [NEW] Migration: `create_tenant_capabilities_table`
```sql
tenant_capabilities
├── id (bigint, PK)
├── tenant_id (string, FK → tenants.id, indexed)
├── capability (string)
└── timestamps
UNIQUE (tenant_id, capability)
```

> [!IMPORTANT]
> CRM does **NOT** appear in this table. Never. Not even as a seeder.

---

### 1B. Enums

#### [NEW] `app/Enums/TenantCapability.php`

```php
enum TenantCapability: string
{
    case Catalog   = 'catalog';
    case Services  = 'services';
    case Ordering  = 'ordering';
    case Booking   = 'booking';
    case Kds       = 'kds';
    case Staff     = 'staff';
    case Payments  = 'payments';   // Infrastructure: serves Ordering OR Booking, depends on neither
    case Delivery  = 'delivery';
    case Inventory = 'inventory';
    case Documents = 'documents';
}
```

**`Payments` dependency is empty** — it is payment processing infrastructure that works with any transaction context (Ordering OR Booking). Do not make it require either.

#### [NEW] `app/Enums/BusinessType.php`
Preset templates only. Never used as routing logic:

```php
enum BusinessType: string
{
    case Restaurant => 'restaurant'; // catalog, ordering, kds, delivery
    case Clinic     => 'clinic';     // services, booking, staff, payments
    case Salon      => 'salon';      // services, booking, staff, payments
    case LawFirm    => 'law_firm';   // services, booking, documents
    case Workshop   => 'workshop';   // services, booking
    case Retail     => 'retail';     // catalog, ordering, inventory, delivery

    public function defaultCapabilities(): array { ... }
    public function defaultPrimaryExperience(): string { ... }   // e.g. 'ordering' or 'booking'
}
```

---

### 1C. Capability Registry

#### [NEW] `app/Capability/CapabilityRegistry.php`
Single source of truth for capability metadata, **dependency graph**, and **experience priority**:

```php
TenantCapability::Ordering => [
    'name'         => 'Food & Retail Ordering',
    'icon'         => 'shopping-cart',
    'dependencies' => [TenantCapability::Catalog],
    'experience'   => 'ordering',          // maps to an Experience key
    'priority'     => 10,                  // higher = more primary CTA
    'nav_label'    => 'Orders',
    'nav_route'    => 'orders.index',
    'pwa_experience' => 'order',
],

TenantCapability::Booking => [
    'name'         => 'Appointment Booking',
    'icon'         => 'calendar',
    'dependencies' => [TenantCapability::Services],
    'experience'   => 'booking',
    'priority'     => 10,
    'nav_label'    => 'Bookings',
    'nav_route'    => 'bookings.index',
    'pwa_experience' => 'book',
],

TenantCapability::Kds => [
    'dependencies' => [TenantCapability::Ordering],
    'priority'     => 0,                   // internal tool, not a CTA
    'pwa_experience' => null,
],

TenantCapability::Payments => [
    'dependencies' => [],                  // infrastructure — no vertical dependency
    'priority'     => 0,
    'pwa_experience' => null,
],
```

#### [NEW] `app/Capability/CapabilityFrontendDto.php`
**Explicit safe DTO** — never sends backend metadata to the browser:

```php
readonly class CapabilityFrontendDto
{
    // Only these fields ever leave the server:
    public string $key;
    public string $name;
    public string $description;
    public string $icon;
    public string $nav_label;
    public string $nav_route;
    public bool $has_pwa_experience;
    public array $dependencies;   // array of keys only, no internal data
}
```

`CapabilityRegistry::forFrontend()` returns `CapabilityFrontendDto[]`. Internal fields (`priority`, `experience`, `pwa_experience`) are never serialized to the client.

---

### 1D. Tenant Model & Service

#### [MODIFY] `app/Models/Tenant.php`
- Add `business_type` and `primary_experience` to `fillable` / `getCustomColumns()`.
- Add `capabilities()` HasMany relationship.
- Add methods:
  - `hasCapability(TenantCapability $cap): bool`
  - `requireCapability(TenantCapability $cap): void` — throws `CapabilityNotEnabledException` (HTTP 403)
  - `enableCapability(TenantCapability $cap): void` — resolves all transitive dependencies first
  - `disableCapability(TenantCapability $cap): void` — refuses if dependents are still active

#### [NEW] `app/Services/TenantCapabilityService.php`
- `applyPreset(Tenant $tenant, BusinessType $type)`: assigns capabilities + sets `primary_experience` from preset default.
- `syncCapabilities(Tenant $tenant, array $caps)`: full capability update with dependency resolution.
- `resolveWithDependencies(array $requested, array $visited = []): array`: expands to include transitive dependencies.
  - **Cycle detection**: tracks a `$visited` set during recursion. If a dependency is encountered that is already in the current resolution path, throws `CapabilityDependencyCycleException` immediately rather than recursing indefinitely. Example: `A → B → C → A` is caught at `A`.
- `validatePrimaryExperience(Tenant $tenant, string $experience): void`: **called before persisting `primary_experience`**. Verifies that the requested experience key corresponds to a capability the tenant currently has enabled. Throws `InvalidPrimaryExperienceException` if the experience does not resolve to any active capability (e.g. selecting `'booking'` when `TenantCapability::Booking` is disabled). This prevents the orphaned state of a tenant configured to send booking links but without the Booking capability.

#### [NEW] `app/Exceptions/CapabilityNotEnabledException.php`
#### [NEW] `app/Exceptions/CapabilityDependencyCycleException.php`
#### [NEW] `app/Exceptions/InvalidPrimaryExperienceException.php`
#### [NEW] `app/Http/Middleware/RequireCapability.php`
- **This is the canonical enforcement layer for route-level protection.** All capability-gated route groups use this middleware.
- Controllers may additionally call `tenant()->requireCapability()` only for especially sensitive individual actions (e.g. destructive or financial operations) — as defense-in-depth — but the middleware is the primary gate. There should not be two independently maintained authorization mechanisms covering the same routes.

---

## Phase 2 — Experience Resolution

---

### 2A. `PwaExperienceResolver`

#### [NEW] `app/Capability/PwaExperienceResolver.php`

```php
class PwaExperienceResolver
{
    /** Returns all active experiences this tenant can offer */
    public function resolve(Tenant $tenant): array
    {
        return collect(CapabilityRegistry::all())
            ->filter(fn ($def, $cap) => $tenant->hasCapability($cap) && $def['pwa_experience'])
            ->mapWithKeys(fn ($def, $cap) => [$def['pwa_experience'] => route('pwa.app', [$tenant->slug, $def['pwa_experience']])])
            ->all();
        // e.g. ['order' => 'https://.../app/abc-pizza/order', 'book' => 'https://.../app/dr-ahmed/book']
    }

    /** Returns primary CTA for WhatsApp bot message */
    public function primaryExperience(Tenant $tenant): string
    {
        // 1. Use explicit tenant override if set
        if ($tenant->primary_experience) {
            return route('pwa.app', [$tenant->slug, $tenant->primary_experience]);
        }

        // 2. Otherwise, resolve by highest-priority capability with a pwa_experience
        $topCap = collect(CapabilityRegistry::all())
            ->filter(fn ($def, $cap) => $tenant->hasCapability($cap) && $def['pwa_experience'])
            ->sortByDesc('priority')
            ->first();

        return $topCap
            ? route('pwa.app', [$tenant->slug, $topCap['pwa_experience']])
            : url('/app/' . $tenant->slug);
    }
}
```

> [!IMPORTANT]
> All route calls use **`$tenant->slug`** (human-readable, URL-friendly), not `$tenant->id`. URLs remain consistent: `/app/abc-pizza/order`, `/app/dr-ahmed/book`.

---

## Phase 3 — Canonical PWA Entry: `/app/{slug}`

---

#### [MODIFY] `routes/web.php`

```php
// New canonical entry
Route::get('/app/{slug}',          [MiniAppController::class, 'index']);
Route::get('/app/{slug}/{experience}', [MiniAppController::class, 'experience']);

// Legacy redirects — existing links continue to work
Route::get('/order/{slug}', fn ($slug) => redirect("/app/{slug}/order", 301));
```

> [!IMPORTANT]
> **`/app/{slug}` does NOT imply authentication.** The page is publicly browsable. The customer **session** is what gets authenticated via the existing WhatsApp token → server-side exchange → `HttpOnly` session flow. This flow is preserved unchanged:
>
> ```
> WhatsApp verified identity → short-lived signed token → /app/{slug}?auth={token} → server exchange → secure session
> ```
>
> The `?auth=` query parameter is processed by `PwaController::exchangeToken()` exactly as it is today, regardless of the new `/app/` prefix.

---

## Phase 4 — Composable PWA Shell (Incremental, Not Rewrite)

---

```
resources/js/Pages/Pwa/
├── MiniApp.jsx                  ← shared shell (unchanged public entry, layout, auth)
├── Panels/
│   ├── ExperienceChooser.jsx    ← shown when multiple experiences available
│   ├── CatalogPanel.jsx         ← extracted from existing OrderMenu.jsx (incremental)
│   ├── BookingPanel.jsx         ← NEW: service selector + slot picker
│   ├── OrderCart.jsx            ← ordering-specific transaction context
│   ├── BookingSelection.jsx     ← booking-specific transaction context (NOT a cart)
│   ├── ConfirmationPanel.jsx    ← shared confirmation/receipt
│   └── TrackingPanel.jsx        ← shared order/booking status
```

> **`OrderCart` and `BookingSelection` are separate components** feeding a shared `ConfirmationPanel`. A booking is not a cart — the two transaction contexts have different data shapes.

> [!NOTE]
> **Existing `OrderMenu.jsx` continues working throughout this migration.** Panels are extracted gradually as `Booking` vertical work begins. No big-bang rewrite of the working restaurant PWA.

#### [MODIFY] `MiniApp.jsx`
Reads `tenant.capabilities` from Inertia shared props. Renders `ExperienceChooser` when multiple experiences exist, or directly routes to the single experience panel.

---

## Phase 5 — Dashboard Navigation (Capability-Driven)

---

#### [MODIFY] `app/Http/Middleware/HandleInertiaRequests.php`
Add to shared props:
```php
'tenant' => [
    ...existing...,
    'capabilities'            => $tenant?->capabilities()->pluck('capability')->toArray() ?? [],
    'primary_experience'      => $tenant?->primary_experience,
    'capability_definitions'  => CapabilityRegistry::forFrontend(),  // CapabilityFrontendDto[]
]
```

#### [MODIFY] `resources/js/Layouts/AuthenticatedLayout.jsx`
- Render nav items dynamically from `capability_definitions` (no hardcoded links).
- Only render an item if its `key` appears in `tenant.capabilities`.
- CRM nav items are **always visible** — they are not gated by any capability.

---

## Phase 6 — Admin Capability Manager UI

---

#### [MODIFY] `resources/js/Pages/Admin/Tenants/Show.jsx`
- Capability cards rendered from `CapabilityFrontendDto[]` — data-driven, no hardcoded capability names.
- Each card: icon, name, description, dependency chain, enabled/disabled toggle.
- Toggle calls `POST /admin/tenants/{id}/capabilities` which calls `TenantCapabilityService::syncCapabilities()`.
- Shows `business_type` preset badge + "Reset to preset defaults" action.
- Shows `primary_experience` dropdown — lets Super Admin override which experience is the WhatsApp CTA.

---

## Phase 7 — `Modules/Bookings` (After Phase 1–4 Stable)

---

#### [NEW] `Modules/Bookings/` via `php artisan module:make Bookings`
- **Models**: `Service`, `Staff`, `StaffSchedule`, `Appointment`
- **All routes** wrapped in `middleware('capability:booking')` — enforced server-side
- **All controllers** call `tenant()->requireCapability(TenantCapability::Booking)` as first guard
- **UI Pages**: `resources/js/Pages/Bookings/` (Calendar, Services editor, Staff profiles)
- **Jobs**: `SendAppointmentReminderJob` (24h and 2h before, uses existing WhatsApp provider)
- **PWA Panel**: `BookingPanel.jsx` + `BookingSelection.jsx` wired into composable `MiniApp.jsx`

---

## Verification Plan

### Automated Tests
```bash
php artisan test --compact --filter=TenantCapabilityTest        # capability CRUD, enforcement
php artisan test --compact --filter=CapabilityRegistryTest      # dependency resolution, DTO whitelist, cycle detection
php artisan test --compact --filter=PwaExperienceResolverTest   # slug URLs, priority, tenant override
php artisan test --compact                                       # full suite, zero regressions
```

### Manual Verification Checklist
1. **Restaurant** registers → capabilities: `catalog`, `ordering`, `kds`, `delivery`. CRM NOT in `tenant_capabilities` table.
2. **Clinic** registers → capabilities: `services`, `booking`, `staff`, `payments`. CRM NOT in table.
3. Call `POST /api/bookings` as a Restaurant tenant → returns **HTTP 403** (middleware enforcement, not controller guard).
4. Enable `kds` via Admin panel on a fresh tenant → `ordering` and `catalog` auto-enabled transitively.
5. Attempt to disable `ordering` when `kds` is active → returns friendly error, blocks the action.
6. **Salon** (has `ordering` + `booking`) → `/app/salon-slug` shows `ExperienceChooser`. URL uses **slug**, not internal ID.
7. WhatsApp bot sends correct primary experience deep-link — URL is `/app/abc-pizza/order`, not `/app/1/order`.
8. Super Admin sets `primary_experience = 'booking'` for a Salon → bot now sends booking deep-link.
9. Super Admin attempts to set `primary_experience = 'booking'` on a Restaurant (no Booking capability) → **rejected** with validation error. The orphaned state is impossible.
10. Existing `/order/{slug}` URLs redirect 301 to `/app/{slug}/order` — no broken links.
11. `CapabilityRegistry::forFrontend()` response contains **only** DTO whitelist fields — no internal `priority`, `experience`, or `pwa_experience` values.
12. Introduce a deliberate circular dependency (`A → B → C → A`) in the registry → `resolveWithDependencies()` throws `CapabilityDependencyCycleException` on boot, not an infinite loop.
13. **Stale `primary_experience` after disablement**: Salon has `primary_experience = 'booking'` → disable `booking` capability → `primary_experience` must be **rejected or auto-reset to null**. The system must never leave a tenant pointing at an experience it can no longer serve.

