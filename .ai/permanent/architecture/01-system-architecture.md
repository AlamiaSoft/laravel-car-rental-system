# System Architecture: OrmEasy Car Rental OS (SaaS)

## 1. Overview & Evolution
**OrmEasy Car Rental OS** is a modern, multi-tenant Software-as-a-Service (SaaS) Operating System tailored specifically for independent and enterprise **Car Rental Agencies**.

Originally derived from a modular WhatsApp-first commerce engine, the codebase has been transformed into a full Car Rental Enterprise System. It provides car rental operators with:
- **Branded Customer PWA Mini-App**: Mobile-first portal where renters browse vehicles, review specs & pricing, submit booking requests, and track rental status.
- **Fleet & Vehicle Asset Management**: Complete vehicle registry tracking registration, VIN, fuel capacity, transmission, daily/weekly/monthly pricing, odometer readings, and maintenance intervals.
- **Driver Management & Dispatch**: Operational tracking of drivers, license expirations, and real-time statuses (`active`, `on_trip`, `off_duty`).
- **Booking Lifecycle & Pricing Engine**: End-to-end booking workflows from inquiry to reservation, vehicle check-out (inspection/odometer), check-in, mileage overage billing, and fuel settlement calculations.
- **WhatsApp Gateway & Automation**: Automated notifications for booking confirmation, pickup reminders, and customer re-engagement via Meta Cloud API and Evolution API.
- **Multi-Tenant SaaS Administration**: Granular tenant capabilities, trial access controls, and platform-wide monitoring.

---

## 2. Core Technology Stack
- **Backend Framework**: Laravel 13 (PHP 8.3)
- **Frontend Architecture**: React 18 with Inertia.js v2 & Tailwind CSS v3
- **Multi-Tenancy Engine**: `stancl/tenancy` v3 utilizing single-database isolation with global `tenant_id` scopes and tenant context middleware.
- **Database Engine**: PostgreSQL 16
- **Caching, Sessions & Queues**: Redis 7
- **WebSockets / Real-Time Events**: Laravel Reverb
- **Automated Testing**: Pest PHP 4 (`php artisan test`)
- **External Media Integration**: Pexels Official REST API (high-resolution stock automotive photography with photographer attribution metadata)
- **Deployment Platform**: Dockerized on Hetzner CX43 via Portainer Stacks + Cloudflare Tunnel

---

## 3. Modular Domain Architecture

The platform organizes core business domains into dedicated modules under `/Modules`:

```
Modules/
├── Rental/           # Car Rental Domain (Vehicles, Drivers, Bookings, Pricing, Maintenance)
├── Crm/              # Customer Relationship Management & Rental Clients
├── Orders/           # Rental Invoicing, Payment Tracking, and Order Records
├── Bot/              # WhatsApp Bot Engine, Webhooks & Workflow Execution
├── Core/             # Shared Tenant Capabilities, Utilities & Settings
├── Authentication/   # Authentication, Multi-Factor Auth (MFA), Social Logins
```

### 3.1. Fleet & Vehicle Domain (`Modules/Rental`)
- **`Vehicle` Model**: Attributes include make, model, year, license plate, VIN, vehicle class (Economy, SUV, Luxury, Sedan), fuel type, fuel tank capacity (liters/gallons), current odometer, status (`available`, `rented`, `maintenance`, `out_of_service`), daily rate, weekly rate, and monthly rate.
- **Pexels Photo Service (`PexelsPhotoService`)**: Integrates real automotive imagery into vehicle profiles without manual re-hosting, retaining photographer attribution and license metadata.
- **Fleet Maintenance (`FleetMaintenanceService`, `MaintenanceLog`)**: Tracks regular maintenance intervals, service logs, and repairs, automatically adjusting vehicle availability.

### 3.2. Drivers Domain (`Modules/Rental`)
- **`Driver` Model**: Tracks assigned staff/chauffeurs, driving license numbers, license expiry dates, contact information, notes, and availability statuses (`active`, `on_trip`, `off_duty`).
- **Driver Allocation**: In the current phase, drivers are managed and dispatched by agency staff. Future roadmap includes a dedicated driver PWA with trip routes and navigation.

### 3.3. Bookings & Pricing Engine (`Modules/Rental`)
- **`Booking` Model**: Encapsulates the rental agreement between a Client and a Vehicle (plus optional assigned Driver). Tracks pickup/return dates and locations, initial/return odometer readings, and status transitions:
  `pending` → `confirmed` → `active` (checked out) → `completed` (returned & inspected) → `cancelled`.
- **`RentalPricingService`**: Supports flexible pricing strategies:
  - **Daily / Weekly / Monthly Rates**: Calculated automatically based on rental duration.
  - **Lump Sum Pricing**: Fixed agreed pricing for bespoke rentals or corporate accounts.
  - **Mileage Limits & Overage Fees**: Compares return odometer with pickup odometer against allowed daily limits.
  - **Fuel Settlement Engine**: Calculates fuel shortfall costs upon return according to the vehicle's fuel tank capacity and agency fuel settlement policies (e.g. *Full-to-Full*, *Prepaid*, or *Shortfall Charge*).
- **`FleetAutoMatcherService` & `BookingRequest`**: Facilitates automated or assisted matching of inbound reservation requests to available fleet inventory and drivers based on vehicle class and date ranges.

### 3.4. Inbound WhatsApp Gateway (`Modules/Bot`)
- Single global webhook endpoints (`/api/bot/whatsapp/webhook` and `/api/bot/whatsapp/evolution/webhook`).
- Inbound inquiries are routed to tenant context via phone number / channel instance mapping.
- Generates secure, opaque 15-minute customer tokens (`CustomerPwaTokenService`) so customers can transition seamlessly from WhatsApp into their agency-branded PWA.
- Queued event listeners (`SendOrderStatusWhatsAppNotification`) send automated booking confirmations and pickup updates.

### 3.5. Customer PWA Mini-App
- Lightweight mobile-first web app served under `/app/{tenant_slug}`.
- Allows renters to view the agency's fleet catalog, inspect vehicle specifications, select rental dates, and submit instant reservation requests.
- Agency branding (custom logo, primary color, business name) is dynamically injected from `TenantSetting` and `TenantSettingsService`.

---

## 4. Multi-Tenancy & Security Isolation
- **Tenant Context**: Initialized automatically via domain, subdomain, or authenticated session by `InitializeTenancy` middleware.
- **Tenant Isolation**: All tenant-scoped models (`Vehicle`, `Driver`, `Booking`, `Client`, `Order`) strictly enforce `tenant_id` scopes.
- **Trial & Subscription Enforcement**: `CheckTenantTrialStatus` middleware restricts mutation operations (POST/PUT/PATCH/DELETE) when a tenant's trial has expired and is in read-only mode, returning a structured JSON 403.
- **Public Storage & Media Symlink**: Tenant-uploaded branding and assets are saved under `storage/app/public/logos/{tenant_id}`. A dedicated route `/storage/{path}` acts as a robust fallback to guarantee public asset delivery across container environments without symlink 403 errors.

---

## 5. Deployment Architecture (Hetzner CX43 VPS)
- **Containerization**: Single orchestrated stack configured in `docker-compose.yml` leveraging `webdevops/php-nginx:8.3-alpine`.
- **Pre-Built Frontend**: Two-stage Docker build automatically compiles Node.js frontend assets (`npm run build`) and composer dependencies.
- **Zero-Touch Container Entrypoint (`docker-entrypoint.sh`)**: On container startup, waits for PostgreSQL readiness and automatically executes `php artisan migrate --force` and `php artisan db:seed --class=CarRentalSeeder --force`.
- **Public Ingress**: Exposes port `8000` locally, proxied via a **Cloudflare Tunnel** mapping hostnames (e.g., `ormeasy-car.alamiaconnect.com`) directly to `http://localhost:8000` with full TLS termination and zero exposed host ports.
