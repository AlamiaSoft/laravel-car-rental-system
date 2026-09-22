# Coding & Architectural Standards: OrmEasy Car Rental OS

## 1. Modular Architecture Principles (`Modules/`)
- All new business capabilities must be scoped within a relevant module (e.g. `Modules/Rental`, `Modules/Crm`, `Modules/Orders`, `Modules/Bot`).
- Cross-module dependencies should be mediated through interfaces, contracts, or domain events rather than tight coupling across concrete classes.

## 2. Multi-Tenancy Rules
- Every database migration creating business tables must include `$table->string('tenant_id');` and foreign key mapping.
- Every Eloquent model operating within a tenant context must use `Stancl\Tenancy\Database\Concerns\BelongsToTenant`.
- Never execute un-scoped queries in tenant-facing controllers or API endpoints.
- When running artisan commands or seeders, always initialize the tenant context:
  ```php
  tenancy()->initialize($tenant);
  ```

## 3. Service Layer & Pricing
- Complex pricing logic, fuel reconciliation, and lifecycle transitions must live in dedicated service classes (e.g. `RentalPricingService`, `BookingLifecycleService`) rather than bloated controllers or Eloquent models.
- Mathematical calculations (rates, durations, fuel shortfall amounts) should be pure and thoroughly covered by unit and feature tests.

## 4. Enums
- Domain states and options must be defined as backed PHP 8.2+ Enums under `App\Enums`:
  - `BookingStatus`: `Pending`, `Confirmed`, `Active`, `Completed`, `Cancelled`
  - `VehicleStatus`: `Available`, `Rented`, `Maintenance`, `OutOfService`
  - `DriverStatus`: `Active`, `OnTrip`, `OffDuty`
  - `PricingMode`: `Daily`, `Weekly`, `Monthly`, `Lumpsum`
  - `FuelSettlement`: `FullToFull`, `SameAsPickup`, `ShortfallCharge`, `Prepaid`
  - `RequestStatus`: `Unmatched`, `Matched`, `Confirmed`, `Rejected`

## 5. Testing Requirements (Pest PHP)
- Every feature, status transition, and security boundary must have automated tests written with Pest PHP.
- Multi-tenancy isolation must be validated for every new entity using tenant isolation tests.
- Run tests regularly: `php artisan test --compact`.

## 6. Code Style (Laravel Pint)
- Ensure all PHP code complies with PSR-12 and Laravel guidelines by running:
  ```bash
  vendor/bin/pint --dirty --format agent
  ```
