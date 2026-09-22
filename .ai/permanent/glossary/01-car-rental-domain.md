# Car Rental Domain Glossary

This document establishes the ubiquitous language used throughout the OrmEasy Car Rental OS codebase, documentation, and database schemas.

---

### Agency / Tenant
An independent car rental business operating on the platform. Each agency has isolated data (`tenant_id`), its own fleet, staff, drivers, customers, branding, and custom PWA URL slug (e.g. `/app/prime-rentals`).

### Fleet
The complete collection of motorized vehicles owned or managed by an Agency. Fleets are categorized by vehicle class (Economy, Compact, Midsize, SUV, Luxury, Van, Electric/Hybrid).

### Vehicle
An individual automotive asset in the fleet.
- **Key Attributes**: Make, Model, Year, License Plate, VIN, Odometer reading, Transmission (Automatic/Manual), Fuel Type, Fuel Tank Capacity (Liters/Gallons).
- **Vehicle Status Lifecycle**:
  - `Available`: Ready for immediate booking and dispatch.
  - `Rented`: Currently checked out on an active rental agreement.
  - `Maintenance`: Undergoing inspection, detailing, routine oil change, or mechanical repair.
  - `OutOfService`: Decommissioned or unavailable for rental.

### Driver
A licensed individual designated to operate a vehicle (e.g. for chauffeured rentals, deliveries, or corporate transfers).
- **Driver Statuses**:
  - `Active`: On duty and available for assignment.
  - `OnTrip`: Currently dispatched on an active booking.
  - `OffDuty`: Not scheduled or unavailable.
- **Attributes**: Full name, contact phone, driving license number, license expiry date, emergency contact.

### Client / CRM Customer
- **Client (`Modules\Rental\Models\Client`)**: The specific party or entity entering into a legal car rental agreement, holding identity verification (ID/Passport) and driving credentials.
- **Customer (`Modules\Crm\Models\Customer`)**: The unified CRM profile tracking communication history, total rental count, aggregate lifetime spend, and address records.

### Booking / Rental Agreement
A confirmed contract reserving a specific Vehicle for a Client over a defined time window.
- **Booking Status Lifecycle**:
  - `Pending`: Initial reservation created, awaiting confirmation or deposit.
  - `Confirmed`: Reservation secured; vehicle reserved on the schedule.
  - `Active`: Client has inspected and checked out the vehicle (initial odometer and fuel level recorded).
  - `Completed`: Vehicle returned, final odometer checked, fuel settlement reconciled, and booking closed.
  - `Cancelled`: Reservation terminated prior to checkout.

### Booking Request (`BookingRequest`)
An unassigned inquiry originating from the Customer PWA or WhatsApp gateway specifying desired dates and vehicle class.
- **Statuses**: `Unmatched` (awaiting vehicle/driver assignment), `Matched` (allocated to inventory), `Confirmed`, `Rejected`.

### Pricing Modes (`PricingMode`)
- **`Daily`**: Standard daily rental rate multiplied by the number of 24-hour periods.
- **`Weekly`**: Discounted tiered rate applied for reservations spanning 7 days or more.
- **`Monthly`**: Long-term lease rate applied for 30+ day rentals.
- **`Lumpsum`**: Fixed negotiated lump-sum fee, commonly used for corporate contracts or custom events.

### Fuel Settlement Policies (`FuelSettlement`)
Rules governing fuel reimbursement upon vehicle check-in:
- **`FullToFull`**: Vehicle is provided with a full tank and must be returned full. Any shortfall is billed at market rates plus an administrative surcharge.
- **`SameAsPickup`**: Vehicle must be returned at the identical fuel level as recorded during check-out inspection.
- **`ShortfallCharge`**: The agency automatically calculates the missing fuel volume using the vehicle's `fuel_tank_capacity` and charges the client accordingly.
- **`Prepaid`**: Client purchases the full tank at checkout and may return the vehicle at any level without penalty.

### Odometer & Mileage Overages
- **Pickup Odometer (`odometer_out`)**: Kilometers/miles recorded at hand-over.
- **Return Odometer (`odometer_in`)**: Kilometers/miles recorded at return.
- **Mileage Allowance**: Total allowed distance across the rental duration. Any distance beyond the allowance incurs an overage rate per unit distance.
