# Roadmap Status Report

Here is a breakdown of our current progress against the `docs/ROADMAP.md`, including what has been successfully implemented, what is pending, and specifically the items we planned for past/current sprints but haven't built yet.

## Sprint 0: Foundation
**Status: ✅ COMPLETED**
- `[x]` Multi-tenancy isolation (`stancl/tenancy`).
- `[x]` Authentication (Google/Facebook Socialite).
- `[x]` Role-Based Access Control (Spatie is installed and traits are on the User model).
- `[x]` Automated Restaurant Onboarding (Tenant auto-creation).

## Sprint 1: Core OS Engine & WhatsApp Ordering MVP
**Status: ✅ COMPLETED**
- `[x]` **Menu Module**: Categories & Products exist.
- `[x]` **Orders Module**: Database schemas for Orders and Order Items with status tracking.
- `[x]` **Bot Module**: Completed end-to-end WhatsApp ordering pipeline (Greeting -> Browse Menu -> Select Category -> Choose Product -> Add to Cart -> Confirm Order -> Invoice receipt) integrated via Evolution API with automatic plain-text fallback mapping.
- `[ ]` **Menu Module (Missed)**: Variants and Deals schemas and APIs have not been implemented.

## Sprint 2: PWA Mini-App Commerce Engine
**Status: ⏳ UP NEXT**
- `[ ]` **PWA Frontend**: Mobile-optimized React + Tailwind ordering app (`/order/{tenant_slug}`).
- `[ ]` **Signed Deep Link Gateway**: Dynamic signed URL generator linking WhatsApp customer phone identity into PWA session.
- `[ ]` **Visual Catalog & Modifiers**: Product images, variants, add-ons, item notes, and search.
- `[ ]` **Persistent Cart & Checkout**: Address/location picker, COD & bank transfer payment options.
- `[ ]` **Real-Time Order Tracking & WhatsApp Milestone Notifications**: PWA tracking timeline + automated WhatsApp status messages on order status changes.
- `[ ]` **Offline Shell & Web App Manifest**: Fast loading, mobile install prompt, and service worker.

## Sprint 3: Kitchen Display System (KDS)
**Status: ✅ COMPLETED**
- `[x]` **KDS React Frontend**: Multi-column Kanban board built.
- `[x]` **Real-Time Sync**: Laravel Reverb/WebSockets integrated into the KDS components (`Kds.jsx` and `UnifiedKds.jsx`) for instant order push.
- `[x]` **UX Audio Alerts**: Sound chime alerts played on KDS when a new order drops.

## Sprint 4: Unified POS & Dashboard
**Status: ✅ COMPLETED**
- `[x]` **Omnichannel POS**: Interface to punch in Walk-in and Dine-In orders, merging them into the same pipeline.
- `[x]` **ROI Dashboard**: Analytics showing metrics and Saved Commission.

## Sprint 5+: Advanced SaaS Features
**Status: 🔄 IN PROGRESS**
- `[x]` **CRM**: Basic database and interface for auto-capturing customers and tracking their metrics.
- `[ ]` **CRM Marketing (Missed)**: WhatsApp Broadcast capabilities are pending.
- `[ ]` Inventory Management (Recipe deductions).
- `[ ]` Finance & Payroll.

---

> [!WARNING]
> ### 🚨 Summary of "Missed" Items from Active/Past Sprints
> 1. **Menu Variants & Deals**: Not yet built in the Menu Module.
> 2. **CRM Marketing**: WhatsApp Broadcast capabilities still pending.
