# Repository Index: OrmEasy Car Rental OS

Maps business and operational concepts to specific directories, files, and architectural layers.

---

## 1. Car Rental Core Domain (`Modules/Rental`)

### 1.1. Fleet & Vehicle Management
- **Model**: `Modules/Rental/app/Models/Vehicle.php`
- **Controller**: `Modules/Rental/app/Http/Controllers/VehicleController.php`
- **Maintenance Logs**: `Modules/Rental/app/Models/MaintenanceLog.php`, `Modules/Rental/app/Http/Controllers/MaintenanceController.php`
- **Maintenance Service**: `Modules/Rental/app/Services/FleetMaintenanceService.php`
- **Pexels Photography Service**: `Modules/Rental/app/Services/PexelsPhotoService.php` (Fetches real stock vehicle images with photographer metadata)
- **Migrations**:
  - `Modules/Rental/database/migrations/2026_09_23_000001_create_vehicles_table.php`
  - `Modules/Rental/database/migrations/2026_09_23_000006_create_maintenance_logs_table.php`
  - `Modules/Rental/database/migrations/2026_09_23_000009_add_image_url_and_photo_metadata_to_vehicles_table.php`

### 1.2. Driver Operations & Dispatch
- **Model**: `Modules/Rental/app/Models/Driver.php`
- **Controller**: `Modules/Rental/app/Http/Controllers/DriverController.php`
- **Driver Status Enum**: `app/Enums/DriverStatus.php` (`Active`, `OnTrip`, `OffDuty`)
- **Migration**: `Modules/Rental/database/migrations/2026_09_23_000002_create_drivers_table.php`

### 1.3. Bookings, Reservations & Pricing Engine
- **Models**:
  - `Modules/Rental/app/Models/Booking.php` (Rental bookings & agreements)
  - `Modules/Rental/app/Models/BookingRequest.php` (Inbound customer inquiries)
  - `Modules/Rental/app/Models/RentalPayment.php` (Deposits, rental fees, settlements)
- **Controllers**:
  - `Modules/Rental/app/Http/Controllers/BookingController.php`
  - `Modules/Rental/app/Http/Controllers/BookingRequestController.php`
  - `Modules/Rental/app/Http/Controllers/RentalPaymentController.php`
  - `Modules/Rental/app/Http/Controllers/RentalDashboardController.php`
- **Services**:
  - `Modules/Rental/app/Services/BookingLifecycleService.php` (Handles check-out, inspection, return, and cancellation)
  - `Modules/Rental/app/Services/RentalPricingService.php` (Daily/Weekly/Monthly/Lumpsum, mileage overages, and fuel settlements)
  - `Modules/Rental/app/Services/FleetAutoMatcherService.php` (Matches pending booking requests to available vehicles & drivers)
- **Enums**:
  - `app/Enums/BookingStatus.php` (`Pending`, `Confirmed`, `Active`, `Completed`, `Cancelled`)
  - `app/Enums/PricingMode.php` (`Daily`, `Weekly`, `Monthly`, `Lumpsum`)
  - `app/Enums/FuelSettlement.php` (`FullToFull`, `SameAsPickup`, `ShortfallCharge`, `Prepaid`)
  - `app/Enums/RequestStatus.php` (`Unmatched`, `Matched`, `Confirmed`, `Rejected`)
  - `app/Enums/VehicleStatus.php` (`Available`, `Rented`, `Maintenance`, `OutOfService`)
- **Migrations**:
  - `Modules/Rental/database/migrations/2026_09_23_000005_create_rental_bookings_table.php`
  - `Modules/Rental/database/migrations/2026_09_23_000007_create_rental_payments_table.php`
  - `Modules/Rental/database/migrations/2026_09_23_000008_create_booking_requests_table.php`

### 1.4. Rental Clients & Vendors
- **Client Model**: `Modules/Rental/app/Models/Client.php`
- **Client Controller**: `Modules/Rental/app/Http/Controllers/ClientController.php`
- **Third-Party Vendor Model**: `Modules/Rental/app/Models/ThirdPartyVendor.php`
- **Vendor Controller**: `Modules/Rental/app/Http/Controllers/ThirdPartyVendorController.php`
- **Migrations**:
  - `Modules/Rental/database/migrations/2026_09_23_000003_create_rental_clients_table.php`
  - `Modules/Rental/database/migrations/2026_09_23_000004_create_third_party_vendors_table.php`

---

## 2. Customer Relationship Management (`Modules/Crm`)
- **Customer Model**: `Modules/Crm/app/Models/Customer.php` (CRM customer records, lifetime spent, total rental orders)
- **Customer Address Model**: `Modules/Crm/app/Models/CustomerAddress.php` (Address history and delivery/dropoff locations)
- **Customer Controllers & Views**: Located in `Modules/Crm` and integrated into the Admin Dashboard.

---

## 3. Customer PWA Mini-App & Branding
- **Controllers**:
  - `app/Http/Controllers/Pwa/MiniAppController.php` (Resolves dynamic experience & renders Mini-App shell)
  - `app/Http/Controllers/Pwa/PwaController.php` (Handles settings, theme customization, and `uploadLogo`)
- **Frontend Components**:
  - Shell Layout: `resources/js/Layouts/PwaLayout.jsx`
  - Mini-App Views: `resources/js/Pages/Pwa/MiniApp.jsx`
  - Agency Settings UI: `resources/js/Pages/Settings/MiniApp.jsx`
- **Fallback Public Media Route**:
  - Defined in `routes/web.php` (`Route::get('/storage/{path}', ...)`) to reliably stream logos and assets from `storage/app/public`.

---

## 4. Inbound WhatsApp Gateway (`Modules/Bot`)
- **Webhook Controllers**:
  - Meta Cloud API: `Modules/Bot/app/Http/Controllers/BotController.php`
  - Evolution API (Baileys): `Modules/Bot/app/Http/Controllers/EvolutionWebhookController.php`
- **Execution Engine**: `Modules/Bot/app/Services/WorkflowExecutionEngine.php`
- **Providers & Resolvers**: `Modules/Bot/app/Services/WhatsAppProviderResolver.php`, `Modules/Bot/app/Services/Providers/`
- **Queued Milestone Notifications**: `app/Listeners/SendOrderStatusWhatsAppNotification.php`
- **Opaque PWA Token Generator**: `Modules/Bot/app/Services/CustomerPwaTokenService.php`

---

## 5. Multi-Tenancy & Platform Security
- **Tenancy Engine**: `stancl/tenancy` configured in `config/tenancy.php`
- **Tenancy Middleware**: `app/Http/Middleware/InitializeTenancy.php`
- **Trial Protection Middleware**: `app/Http/Middleware/CheckTenantTrialStatus.php` (Blocks write operations on expired trials)
- **Capability Engine**:
  - `app/Enums/BusinessType.php` (Includes `BusinessType::CarRental`)
  - `app/Services/TenantCapabilityService.php` (Applies feature presets for car rental agencies)
  - `app/Http/Middleware/RequireCapability.php`

---

## 6. Seeders & Data Fixtures
- **Primary Seeder**: `database/seeders/CarRentalSeeder.php`
  - Provisions `prime-rentals` tenant with CarRental capability preset.
  - Seeds 7 fleet vehicles across Economy, SUV, Luxury, Sedan, and Electric classes with Pexels photography.
  - Seeds 6 licensed drivers with real-world contact info and statuses.
  - Seeds 6 CRM clients & addresses.
  - Seeds 7 bookings, 6 orders, and 5 payment settlements across active, completed, and pending states.

---

## 7. Containerization & Deployment
- **`Dockerfile`**: Multi-stage build with Composer, Node 20 (`npm run build`), PHP 8.3 Nginx runtime, and automated entrypoint.
- **`docker-compose.yml`**: Full production stack with `app`, `worker`, `cron`, `reverb`, `db` (PostgreSQL 16), `redis` (Redis 7), and shared `storage-data` volume.
- **`docker-entrypoint.sh`**: Zero-touch container startup script executing migrations and seeders automatically.
- **`deploy_hetzner.md`**: Complete step-by-step deployment guide for Hetzner CX43 VPS with Portainer Stacks and Cloudflare Tunnel.
