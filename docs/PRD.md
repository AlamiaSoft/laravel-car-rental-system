# Product Requirements Document (PRD)

## 1. Product Vision
**Alamia Business OS (Restaurant & Services)**: A multi-tenant SaaS transforming WhatsApp into an automated conversational gateway that opens high-fidelity, tenant-branded PWA Mini-Apps for ordering, booking, POS operations, kitchen management, CRM, and marketing.

## 2. Target Segments
- **Primary**: Food businesses (Pizza shops, Cloud Kitchens, Cafes, Quick Service Restaurants).
- **Secondary (Multi-Vertical Expansion)**: Clinics/Doctors (Appointments), Salons (Booking), Professional Services (Consultations).

## 3. Core Ordering Journey (PWA + WhatsApp Gateway)
1. **Acquisition / Trigger**: Customer sends a greeting ("Hi", "Menu", "Order") to the business's WhatsApp number.
2. **Instant Gateway Reply**: WhatsApp Bot responds with a personalized, short-lived signed link (`/order/{tenant_slug}?auth={signed_token}`).
3. **PWA Mini-App Experience**:
   - High-fidelity visual menu categorized into sections (Deals, Fast Food, Drinks).
   - Item customizations: Size variants, add-ons, item notes (e.g. "Extra cheese, no mayo").
   - Frictionless Cart & Checkout: Phone number auto-populated from signed link; address pin-dropping or saved address auto-fill.
   - Payment Selection: Cash on Delivery (COD) or Direct Online Banking.
4. **Order Processing & Real-Time Sync**:
   - Order instantly pushes to the tenant's Unified KDS screen via Laravel Reverb WebSockets with audio alerts.
   - Customer profile & order statistics are captured in tenant CRM.
5. **Transactional WhatsApp Milestone Updates**:
   - Customer receives automated updates: "Order Confirmed #1234", "Preparing 🍕", "Out for Delivery 🚴".

## 4. Monetization Model
- **Setup Fee**: 2,000 – 5,000 PKR.
- **Commission / Transaction Fee**: 1.5% commission on direct orders (vs Foodpanda's 20–30% take rate).
- **SaaS Subscription**: Tiered monthly plans for multi-branch, custom domain, and broadcast marketing.

