# Central SaaS Admin Dashboard (Tenancy Provider) - Feature Planning

As the system expands into a true multi-tenant SaaS, the central platform owner (the "Tenancy Provider") needs a robust dashboard to manage tenants, subscriptions, overall system health, and global configurations. 

This document outlines the proposed features for the Central Admin panel.

## Core Features & Modules

### 1. Tenant & Customer Management
- **Tenant Directory**: A list of all registered restaurants/tenants.
- **Tenant Details**: View individual tenant statistics (total orders, GMV, active users).
- **Tenant Impersonation**: Ability for admins to securely log in as a tenant to debug issues or provide customer support without requiring the tenant's password.
- **Lifecycle Management**: Suspend, ban, or delete tenants.
- **Onboarding & Verification**: Configurable flow (auto-approval by default, with an option to require manual review).

### 2. Subscription & Billing (SaaS Management)
- **Plans & Pricing Management**: Create, edit, and archive subscription tiers (e.g., Starter, Pro, Enterprise).
- **Billing Overview**: View MRR (Monthly Recurring Revenue), churn rate, and active subscriptions.
- **Invoices & Payments**: View billing history across all tenants. *(Note: Needs research on optimal payment gateways for the Pakistani market before integrating).*
- **Feature Toggles**: Toggle specific premium features on/off for individual tenants based on their subscription tier or custom deals.

### 3. System Health & Analytics
- **Global Metrics**: High-level KPI dashboard showing total system-wide message volume, orders processed, and active WhatsApp sessions.
- **System Logs & Errors**: Centralized view of application exceptions, failed jobs, and WhatsApp webhook failures across all tenants.
- **Queue Management**: Monitor Laravel Horizon or queue worker status to ensure delayed messages or heavy processes are running smoothly.

### 4. Global Configuration & WhatsApp Infrastructure
- **Meta App Settings**: If using Embedded Signup (Option B), the central admin panel must manage the SaaS-wide Meta App ID, Secret, and global Webhook Verify Tokens.
- **Domain Management**: Manage custom domains provided to tenants (if offering white-labeled web interfaces).
- **System Notifications**: Broadcast announcements to all tenant dashboards (e.g., "System maintenance scheduled for Sunday").

---

## Technical Implementation Approach (Future Sprint)

When we are ready to build this, we will implement it using **Filament PHP** or a dedicated **Inertia/React Admin Area** separate from the Tenant UI.

**Recommended Setup:**
- We currently have a single database where the `tenants` table lives.
- We will create a `routes/admin.php` and an `Admin` middleware to restrict access to platform owners (e.g., Super Admins).
- The central admin panel will operate in the "central" context, meaning Tenancy will **not** be initialized while navigating these pages. It will query the central database directly.
