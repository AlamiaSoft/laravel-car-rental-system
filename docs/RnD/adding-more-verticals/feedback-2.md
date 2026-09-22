This is **much better**, but I would make a few changes before letting the dev agent implement it.

### 1. Don't use `elseif` for PWA capability routing

This is still subtly vertical-thinking:

```php
if (Ordering) {
    order()
} elseif (Booking) {
    book()
}
```

What happens when a tenant has **both**?

Use a capability → experience/action mapping:

```text
Tenant
 ├── ordering → Order experience
 ├── booking  → Booking experience
 ├── catalog  → Catalog experience
 └── ...
```

I'd make `/app/{slug}` the **canonical entry point**, but allow deep links:

```text
/app/abc-pizza
/app/abc-pizza/order
/app/dr-ahmed/book
/app/abc-pizza/menu
```

The gateway can choose the most relevant CTA based on capabilities.

---

### 2. `services` is missing from `TenantCapability`

Your `BusinessType` uses:

```text
services
```

but the enum doesn't define it.

Add:

```php
case Services = 'services';
```

This is important because **Services is a genuine reusable capability**, not an appointment-specific concept.

---

### 3. Don't make capabilities only a UI concept

This is the biggest thing I'd tell the dev agent.

Every capability must have **backend authorization/enforcement**, not merely sidebar visibility.

For example:

```text
UI hides Bookings
       ≠
Booking API unavailable
```

Controllers, policies, jobs, routes and APIs should enforce:

```php
$tenant->requireCapability(TenantCapability::Booking);
```

Otherwise someone can simply call the endpoint directly.

---

### 4. Capability dependencies need to exist

You'll quickly encounter:

```text
Ordering → Catalog
Booking  → Services
KDS      → Ordering
Delivery → Ordering
Payments → Ordering OR Booking
```

So define dependencies centrally.

Example:

```text
KDS
 └── requires Ordering

Ordering
 └── requires Catalog

Booking
 └── requires Services
```

Then `enableCapability(Kds)` should either automatically enable dependencies or reject the operation.

---

### 5. Add capability metadata

Don't hardcode sidebar labels/icons/routes everywhere.

Something like:

```text
CapabilityDefinition
├── key
├── name
├── description
├── icon
├── dependencies
├── routes
├── navigation
└── feature_flags
```

Then your Admin Capability Manager can become almost completely data-driven.

---

### 6. Keep `business_type`

**Don't remove it.** Your current approach of demoting it to a preset is correct.

It becomes:

```text
business_type = clinic
        ↓
initial capability configuration
        ↓
tenant can customize afterwards
```

That's useful for onboarding, analytics, templates and default UX.

---

### 7. CRM should probably be a platform capability

I'd actually make `crm` **enabled by default for every tenant**, rather than treating it like an optional vertical capability.

Your core proposition is increasingly:

```text
Customer
   ↓
Gateway
   ↓
Mini-App
   ↓
CRM
   ↓
Business transaction
```

CRM is foundational infrastructure.

---

### 8. Your PWA should eventually be capability-composed

Rather than:

```text
OrderMenu.jsx
BookingMenu.jsx
```

think:

```text
MiniApp
├── Service/Catalog discovery
├── Product/Service detail
├── Cart OR Booking basket
├── Customer identity
├── Checkout/Confirmation
└── Tracking/Status
```

Then vertical-specific components plug into the common shell.

---

## Verdict

**Architecture: GOOD.**

I'd make these changes before implementation:

1. ✅ Add `Services` capability.
2. ✅ `/app/{slug}` as canonical PWA entry point.
3. ✅ Replace `if/elseif` capability routing with capability/experience resolution.
4. ✅ Enforce capabilities server-side, not just UI.
5. ✅ Add capability dependencies.
6. ✅ Create centralized capability definitions/metadata.
7. ✅ Make CRM foundational/default.
8. ✅ Design PWA as composable capabilities, not separate vertical apps.

Do that and you're no longer merely making the restaurant system extensible—you've created a **genuine multi-vertical business interaction platform**.
