This v2 is **architecturally solid**. I'd approve it, with a few final corrections before implementation.

### 1. Critical: don't store CRM in `tenant_capabilities`

You explicitly say CRM is foundational, but then:

> migration seeder ensures all existing tenants receive a `crm` record in `tenant_capabilities`

That contradicts the model.

If CRM is **platform infrastructure**, don't represent it as an optional capability. Keep:

```text
tenant_capabilities
→ catalog
→ services
→ ordering
→ booking
→ ...
```

and make CRM universally available.

Otherwise six months from now someone will ask:

> "Can I disable CRM?"

and you've created a nonsensical state.

---

### 2. `Payments` dependency is not actually empty

You currently have:

```text
Payments → []
```

That's fine **if Payments means payment infrastructure**, because it can serve ordering or booking.

But define the distinction:

```text
Payments = capability/infrastructure
Payment methods = tenant configuration
```

For example, a clinic could have Payments + Booking, while a restaurant could have Payments + Ordering.

Don't make Payments automatically require either one.

---

### 3. Be careful with `CartPanel` for bookings

This line is slightly misleading:

> CartPanel — shared: applies to both ordering and bookings

A booking isn't necessarily a cart.

You could eventually have:

```text
TransactionContext
├── OrderCart
└── BookingSelection
```

Both feed into:

```text
Checkout / Confirmation
```

That keeps the abstraction clean.

---

### 4. `CapabilityRegistry::forFrontend()` should never blindly expose backend metadata

Good idea, but make it an explicit DTO/whitelist.

Don't send arbitrary registry definitions to the browser.

Expose only:

```text
key
name
description
icon
nav_label
nav_route
pwa availability
dependencies
```

Never expose internal implementation details.

---

### 5. Primary experience needs explicit priority

This is important.

If a tenant has:

```text
ordering + booking
```

you don't want `primaryExperience()` accidentally depending on enum/registry ordering.

Give capabilities an explicit:

```text
priority
default_cta
```

or tenant-configurable primary experience.

For example:

```text
Salon
→ primary = booking

Restaurant
→ primary = ordering

Restaurant + catering
→ primary = ordering
```

---

### 6. Add an `Experience` abstraction eventually

You're very close to something powerful.

Capabilities:

```text
ordering
booking
catalog
services
```

produce **experiences**:

```text
Order
Book
Browse
Track
```

So I'd avoid letting PWA code directly understand every capability forever.

Eventually:

```text
Capability → Experience → PWA Panel
```

That's the cleanest long-term architecture.

---

### 7. One security issue: signed PWA tokens

Make sure your existing token architecture remains:

```text
WhatsApp verified identity
        ↓
short-lived one-time token
        ↓
server-side exchange
        ↓
secure session
```

Don't make `/app/{slug}` itself imply authentication. A public PWA should remain browsable; the **customer session** is what gets authenticated.

---

### 8. Migration strategy is good

I particularly like:

> extract panels incrementally, not big-bang rewrite.

**Keep that.** Don't let the agent rewrite the working restaurant PWA just to achieve architectural purity.

---

## Final verdict

**MUST make adjustments.**

I'd only amend these before implementation:

1. **Remove CRM from `tenant_capabilities` entirely.**
2. Define Payments as infrastructure, not dependent on a vertical.
3. Separate `OrderCart` from `BookingSelection`.
4. Make `forFrontend()` an explicit safe DTO.
5. Add explicit experience priority/default CTA.
6. Gradually evolve toward `Capability → Experience → Panel`.
7. Preserve the secure token → session model.

With those changes, this isn't merely "adding appointments without breaking restaurants."

You're establishing the foundation for **Ormeasy as a capability-composed platform**, where a tenant can potentially build its customer experience by combining capabilities rather than being forced into a predefined vertical.
