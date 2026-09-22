This is the **right corrective work**, but I would make **4 small adjustments before letting the agent implement it**:

1. **Don't use `business_type` in `MiniAppController`**

   * The PWA guard should be **capability → experience** only.
   * `business_type` remains onboarding/preset metadata.

2. **Don't hardcode "Clinic/Salon/Law Firm" inside `MiniApp.jsx`**

   * That's exactly the coupling you're trying to eliminate.
   * `MiniApp` should receive a resolved **experience descriptor**:

   ```text
   experience: booking
   capabilities: [...]
   ```

   and render `BookingPanel`.

   * The panel itself should not care whether the tenant is a clinic, salon, or lawyer.

3. **Be careful with `403` vs redirect**

   * `/app/foo/order` when ordering isn't enabled should preferably **redirect to the tenant's primary valid experience**.
   * Directly hitting an internal backend endpoint without capability → **403**.
   * This gives customers a graceful UX while maintaining real security.

4. **Registration test must match the actual preset**

   * Your earlier v4 says Clinic = `services, booking, staff, payments`.
   * This plan's test says it also gets `documents`.
   * Decide explicitly; don't let the implementation silently diverge.

### One more important test

Add:

> **Change capabilities after the PWA was opened.**

Example:

```text
Restaurant
→ customer has /app/foo/order open
→ admin disables ordering
→ subsequent order request/API → 403
```

Never rely on the frontend/PWA having made an earlier capability decision. **Backend remains authoritative.**

Other than those points, **I'd approve this plan.** It fixes the actual weakness revealed by live testing: capability architecture is only meaningful if **every domain boundary—including URLs and PWA experiences—is actually enforced by it.**
