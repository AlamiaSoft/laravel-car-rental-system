# Product Roadmap & Sprint Planning

This document maps out feature delivery across sprints, reflecting the **PWA Mini-App + WhatsApp Gateway Architecture**.

## Sprint 0: Foundation [COMPLETED]
- Multi-tenancy isolation (`stancl/tenancy`).
- Authentication (Google/Facebook Socialite).
- Role-Based Access Control (Owner, Manager, Staff, Customer).
- Automated Restaurant Onboarding (Tenant auto-creation).

## Sprint 1: Core OS Engine & WhatsApp Gateway MVP [COMPLETED]
- **Menu Module**: Database schemas and APIs for Categories, Products, and Images.
- **Orders Module**: Database schemas for Orders and Order Items with status tracking (`Pending`, `Preparing`, `Ready`, `Delivered`).
- **WhatsApp Gateway (Evolution API)**: Webhook receiver, device QR linking, tenant message isolation, and auto-conversion fallback.

## Sprint 2: PWA Mini-App Commerce Engine [UP NEXT]
*Goal: Provide a lightning-fast, mobile-first ordering Mini-App launched seamlessly via WhatsApp signed deep links.*
- **PWA Frontend**: Mobile-optimized React + Tailwind ordering app (`/order/{tenant-slug}`).
- **Catalog & Customizations**: Visual food categories, variants, add-ons, item notes, and search.
- **Persistent Cart & Checkout**: Seamless session linking (auto-detect customer phone from signed WhatsApp link), address/location picker, and COD / bank transfer checkout.
- **Order Tracking**: Live order status timeline (`/order/{tenant-slug}/track/{order_id}`).
- **Transactional WhatsApp Alerts**: Automated milestone notifications sent via Evolution API when order status updates.
- **PWA Manifest & Offline Shell**: Web app manifest, service worker for instant loading and optional home-screen installation.

## Sprint 3: Kitchen Display System (KDS) [COMPLETED]
- **KDS React Frontend**: Multi-column Kanban board (`Kds.jsx`) and Unified ticket grid (`UnifiedKds.jsx`).
- **Real-Time WebSockets**: Laravel Reverb container pushing instant `OrderCreated` and `OrderStatusUpdated` broadcasts.
- **UX Audio Alerts**: Persistent sound chime notifications when new orders drop.

## Sprint 4: Unified POS & Dashboard [COMPLETED]
- **Omnichannel POS**: Interface to manually punch in Walk-in and Dine-In orders, merging them into the same pipeline.
- **ROI Dashboard**: Analytics showing gross sales, top items, and explicitly highlighting "Saved Commission" vs Foodpanda.

## Sprint 5: AI Conversational Assistance & Smart Upselling
- **Natural Language Parsing**: Optional AI fallback for raw text or voice note order translation.
- **Smart Recommendations**: Dynamic cross-selling inside the PWA cart (e.g. "Add a drink for Rs. 100").

## Sprint 6+: Multi-Vertical SaaS & Advanced Expansion
- **Multi-Vertical Mini-Apps**: Appointment booking for Clinics, Salons, and Professional Services.
- **CRM & Marketing**: Automated WhatsApp Broadcast campaigns and customer segmentation.
- **Inventory & Recipe Management**: Automated ingredient deductions per order.
- **Finance & Multi-Tenant Billing Engine**: Automated invoicing and payout tracking.
