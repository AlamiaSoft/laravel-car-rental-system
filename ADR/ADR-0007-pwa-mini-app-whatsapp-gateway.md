# ADR-0007: PWA Mini-App with WhatsApp Conversational Gateway

## Status
**Accepted**

## Context
The initial architecture treated WhatsApp as the entire application runtime. Complex multi-step interactions (browsing categories, configuring item modifiers, managing cart state, inputting delivery addresses, and confirming orders) occurred via conversational state handlers. 

While functional, this approach introduced significant pain points:
1. **Protocol Limitations**: WhatsApp Web (Baileys) connectors in third-party engines (like Evolution API) exhibit instability and incompatibility with interactive buttons and lists, requiring plain-text fallback numbering.
2. **UX Restrictions**: WhatsApp chat cannot match the fidelity of native web UI for visual food browsing, product variant selections, modifier add-ons, and map-based pin dropping.
3. **Message Volume & Ban Risk**: A single order generated 10–20 back-and-forth messages over WhatsApp, increasing outbound bandwidth, processing overhead, and number ban risk.
4. **WABA Friction**: WhatsApp Business API (WABA) onboarding via Meta Embedded Signup adds overhead for non-technical small restaurant owners.

## Decision
We decouple **customer acquisition and notifications** from the **ordering commerce interface**:
- **WhatsApp (Evolution API / Meta)** acts strictly as the **Conversational Gateway & Notification Transport**. When a customer messages "Hi", the bot replies with a branded, secure deep link to the tenant's ordering PWA.
- **PWA Mini-App** acts as the **Commerce Engine**. A lightweight, ultra-fast, mobile-first Web / PWA interface provides full visual menus, product variants/deals, real-time cart, location selection, and instant checkout.
- **Order Notifications**: Once an order is placed via the PWA, background event listeners trigger transactional notifications over WhatsApp (Order Received, Preparing, Out for Delivery, Delivered).

```text
                 CUSTOMER
                    │
              "Hi" on WhatsApp
                    │
                    ▼
          Evolution API (Gateway)
                    │
                    ▼
          [1. UPSERT CRM Customer (phone)]
          [2. Generate 15-min Opaque Exchange Token]
                    │
                    ▼
         "Order here 👇 [Signed Link]"
                    │
                    ▼
          PWA Token Exchange Endpoint
          [3. Consume Token -> Establish HttpOnly Session]
                    │
                    ▼
        ┌─────────────────────────┐
        │ Tenant PWA Mini-App     │
        │ (Clean URL: /order/slug)│
        │                         │
        │ 🍕 Interactive Menu     │
        │ 🏷️ Variants & Modifiers  │
        │ 🛒 Persistent Cart      │
        │ 📍 Map / Address Picker │
        │ 💳 COD / Bank Transfer  │
        │ 📦 Real-Time Tracking   │
        └────────────┬────────────┘
                     │
                     ▼
          Laravel Multi-Tenant APIs
          [4. Update CRM Profile (Name, Address, LTV)]
          [5. Create Order & Dispatch KDS Reverb Event]
                     │
            ┌────────┼────────┐
            ▼        ▼        ▼
          CRM     Orders   Unified KDS / POS
                     │
                     ▼
          Transactional WhatsApp
          Status Milestone Alerts
```

## Consequences

### Positive
- **Instant Lead Capture**: CRM captures the customer's verified WhatsApp phone number at the very first message ("Hi"), retaining customer identity even if they drop off without completing an order.
- **Enhanced Security & Privacy**: Customer phone numbers are never exposed in browser URLs. Links contain opaque, short-lived (15-min) exchange tokens that convert to secure `HttpOnly` sessions and redirect to clean URLs.
- **Rich "Customer Memory" CRM**: Customer profile serves as the single source of truth (Identity, Saved Addresses, Order History, Lifetime Value, Favorite Items).
- **Zero-Install Friction**: Operates instantly in the customer's mobile browser upon link tap, with optional PWA home-screen installability.
- **Multi-Vertical Extensibility**: The exact same gateway + mini-app engine generalizes seamlessly to Clinics, Salons, and Professional Services.

### Negative / Tradeoffs
- Requires maintaining client-facing PWA routes alongside admin/tenant Inertia dashboard pages.
- Requires token exchange state management or cache consumption to enforce one-time usage.

## Security & Session Invariants
1. **Opaque Exchange Tokens**: Gateway links contain encrypted/signed tokens referencing `tenant_id` + `customer_id` with a 15-minute expiration window. Raw phone numbers are never embedded in the URL.
2. **One-Time Token Exchange**: Accessing `/order/{tenant_slug}?auth={token}` validates the token, seeds the secure customer session, and immediately redirects to the clean route `/order/{tenant_slug}` to strip the token from browser history and share sheets.
3. **Tenant Isolation**: All public PWA API endpoints (`/api/pwa/...` or Inertia routes) must execute inside initialized tenancy context (`tenancy()->initialize($tenant)`).
4. **PWA Standalone Mode**: Direct visitors without WhatsApp gateway tokens can browse the menu and provide their phone number during checkout, creating/linking their CRM profile.
