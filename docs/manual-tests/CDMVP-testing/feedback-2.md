**Make following changes then consider it approved after the changes. This is now coherent and implementation-ready.**

Only **3 minor points** I'd still add:

1. **Avoid hardcoding `order` / `book` in `MiniAppController` long-term.**
   These are currently experience keys, which is fine for v1, but ideally `CapabilityRegistry` should be the source of truth for mapping capability → experience. Don't let another controller accumulate `if ($experience === 'order')` logic.

2. **Handle the "no valid experience" case explicitly.**
   If a tenant has capabilities like `payments`, `inventory`, or `documents` but no customer-facing experience, `/app/{slug}` needs a deliberate fallback:

   * informational/coming-soon page, or
   * `404`, rather than an empty/broken PWA.

3. **Add authorization to the admin capability mutation itself.**
   Make sure only authorized tenant owners/managers/Super Admins can disable capabilities. Don't rely merely on the frontend hiding the toggle.

Otherwise, **stop architecture work and implement.**

The important thing you've achieved here is:

```text
business_type
     ↓
onboarding preset only

capabilities
     ↓
authorization + available functionality

experiences
     ↓
customer-facing UX

PWA panels
     ↓
reusable presentation
```

That's a genuinely scalable separation. Adding **Hotel/PMS later** can therefore happen largely in its own domain without contaminating the restaurant/booking architecture.
