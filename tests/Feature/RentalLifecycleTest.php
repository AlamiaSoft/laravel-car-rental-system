<?php

use App\Enums\BookingStatus;
use App\Enums\BusinessType;
use App\Enums\DriverStatus;
use App\Enums\FuelSettlement;
use App\Enums\PricingMode;
use App\Enums\RequestStatus;
use App\Enums\TenantCapability;
use App\Enums\VehicleStatus;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantCapabilityService;
use Carbon\Carbon;
use Modules\Rental\Models\Booking;
use Modules\Rental\Models\BookingRequest;
use Modules\Rental\Models\Client;
use Modules\Rental\Models\Driver;
use Modules\Rental\Models\Vehicle;
use Modules\Rental\Services\BookingLifecycleService;
use Modules\Rental\Services\FleetAutoMatcherService;
use Modules\Rental\Services\RentalPricingService;

beforeEach(function () {
    Tenant::query()->delete();

    $this->tenant = Tenant::create([
        'id' => 'prime-rentals',
        'name' => 'Prime Car Rentals',
        'is_active' => true,
        'subscription_status' => 'trial',
        'trial_ends_at' => now()->addDays(15),
    ]);

    tenancy()->initialize($this->tenant);

    $capabilityService = new TenantCapabilityService;
    $capabilityService->applyPreset($this->tenant, BusinessType::CarRental);

    $this->user = User::factory()->create([
        'tenant_id' => $this->tenant->id,
    ]);
});

test('car rental business preset seeds fleet and rentals capabilities with rent experience', function () {
    expect($this->tenant->hasCapability(TenantCapability::Fleet))->toBeTrue();
    expect($this->tenant->hasCapability(TenantCapability::Rentals))->toBeTrue();
    expect($this->tenant->hasCapability(TenantCapability::Payments))->toBeTrue();
    expect($this->tenant->fresh()->primary_experience)->toBe('rent');
});

test('vehicle creation stores specifications and fuel tank capacity scoped to tenant', function () {
    $vehicle = Vehicle::create([
        'plate_number' => 'LEA-23-4567',
        'model' => 'Toyota Corolla Altis',
        'year' => 2023,
        'fuel_tank_capacity' => 55.0,
        'daily_rate' => 6000.0,
        'mileage' => 25000,
        'next_service_due_mileage' => 30000,
        'status' => VehicleStatus::Available,
    ]);

    expect($vehicle->tenant_id)->toBe('prime-rentals');
    expect((float) $vehicle->fuel_tank_capacity)->toEqual(55.0);
    expect($vehicle->status)->toBe(VehicleStatus::Available);
});

test('pricing service calculates duration and precise fuel shortfall against vehicle tank capacity', function () {
    $pricingService = new RentalPricingService;

    // 1. Duration Days (inclusive calendar days)
    $start = Carbon::parse('2026-10-01 10:00:00');
    $end = Carbon::parse('2026-10-03 18:00:00');
    $days = $pricingService->calculateNumberOfDays($start, $end);
    expect($days)->toBe(3);

    // 2. Exact Fuel Shortfall with vehicle tank capacity (50 Liters, start at 100%, return at 50% => 25L deficit)
    // 25L * Rs. 280/L = Rs. 7,000
    $vehicle = new Vehicle(['fuel_tank_capacity' => 50.0]);
    $shortfallAmount = $pricingService->calculateFuelShortfallFee(100, 50, $vehicle);
    expect($shortfallAmount)->toBe(7000.0);

    // 3. Zero Shortfall when fuel return >= fuel start
    $zeroShortfall = $pricingService->calculateFuelShortfallFee(50, 75, $vehicle);
    expect($zeroShortfall)->toBe(0.0);

    // 4. Fallback full tank cost when vehicle has no tank capacity specified (50% deficit of default Rs. 8,000 = Rs. 4,000)
    $fallbackAmount = $pricingService->calculateFuelShortfallFee(100, 50, null);
    expect($fallbackAmount)->toBe(4000.0);
});

test('booking lifecycle handles pickup and drop-off with fuel charged to bill', function () {
    $vehicle = Vehicle::create([
        'plate_number' => 'ISB-24-9988',
        'model' => 'Honda Civic RS',
        'year' => 2024,
        'daily_rate' => 8000.0,
        'fuel_tank_capacity' => 47.0,
        'mileage' => 12000,
        'next_service_due_mileage' => 17000,
        'status' => VehicleStatus::Available,
    ]);

    $driver = Driver::create([
        'name' => 'Khurram Shahzad',
        'phone' => '03001234567',
        'license_number' => 'DL-98765',
        'status' => DriverStatus::Available,
    ]);

    $client = Client::create([
        'name' => 'Bilal Ahmed',
        'phone' => '03219876543',
        'cnic' => '35201-1234567-1',
    ]);

    $lifecycleService = app(BookingLifecycleService::class);

    // 1. Create Booking
    $booking = $lifecycleService->create([
        'client_id' => $client->id,
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'pricing_mode' => PricingMode::Daily,
        'daily_driver_rate' => 7500.0,
        'daily_lunch_rate' => 500.0,
        'start_date' => Carbon::parse('2026-10-01 09:00:00'),
    ]);

    expect($booking->status)->toBe(BookingStatus::Pending);
    expect($vehicle->fresh()->status)->toBe(VehicleStatus::Rented);
    expect($driver->fresh()->status)->toBe(DriverStatus::OnTrip);

    // 2. Perform Pickup
    $booking = $lifecycleService->pickup($booking, 100, 12000);

    expect($booking->status)->toBe(BookingStatus::Active);
    expect($booking->mileage_pickup)->toBe(12000);
    expect($booking->fuel_level_pickup)->toBe(100);

    // 3. Perform Drop-off with fuel shortfall after exactly 2 days (start 100%, return 50%, 47L tank => 23.5L deficit @ 280 = Rs. 6,580)
    $dropoffDate = Carbon::parse('2026-10-03 09:00:00');
    $booking = $lifecycleService->dropoff(
        $booking,
        50,
        12500,
        FuelSettlement::ChargedToBill,
        $dropoffDate
    );

    expect($booking->status)->toBe(BookingStatus::Completed);
    expect((float) $booking->fuel_shortfall_fee)->toBe(6580.0);
    expect($booking->fuel_settlement)->toBe(FuelSettlement::ChargedToBill);
    // 2 days * (7500 + 500) = 16000 + 6580 shortfall = 22580
    expect((float) $booking->total_cost)->toBe(22580.0);

    // Vehicle and driver freed up
    expect($vehicle->fresh()->status)->toBe(VehicleStatus::Available);
    expect($vehicle->fresh()->mileage)->toBe(12500);
    expect($driver->fresh()->status)->toBe(DriverStatus::Available);
});

test('drop-off automatically flags vehicle for maintenance when odometer exceeds due mileage', function () {
    $vehicle = Vehicle::create([
        'plate_number' => 'KHI-22-1122',
        'model' => 'Toyota Hilux Revo',
        'year' => 2022,
        'daily_rate' => 15000.0,
        'fuel_tank_capacity' => 80.0,
        'mileage' => 49500,
        'next_service_due_mileage' => 50000,
        'status' => VehicleStatus::Available,
    ]);

    $client = Client::create([
        'name' => 'Asim Munir',
        'phone' => '03335557788',
    ]);

    $lifecycleService = app(BookingLifecycleService::class);

    $booking = $lifecycleService->create([
        'client_id' => $client->id,
        'vehicle_id' => $vehicle->id,
        'pricing_mode' => PricingMode::Daily,
        'daily_driver_rate' => 14000.0,
        'daily_lunch_rate' => 1000.0,
        'start_date' => Carbon::parse('2026-10-05 08:00:00'),
    ]);

    $booking = $lifecycleService->pickup($booking, 100, 49500);

    // Trip of 700 km puts odometer at 50,200 km (over 50,000 threshold)
    $lifecycleService->dropoff(
        $booking,
        100,
        50200,
        FuelSettlement::RefilledByClient,
        Carbon::parse('2026-10-06 18:00:00')
    );

    // Vehicle status must be automatically set to Maintenance
    expect($vehicle->fresh()->status)->toBe(VehicleStatus::Maintenance);
    expect($vehicle->fresh()->mileage)->toBe(50200);
});

test('whatsapp auto matcher ingests inquiry, matches fleet, and converts to confirmed booking', function () {
    $vehicle = Vehicle::create([
        'plate_number' => 'MN-24-7788',
        'model' => 'Toyota Fortuner Legender',
        'year' => 2024,
        'daily_rate' => 25000.0,
        'status' => VehicleStatus::Available,
    ]);

    $driver = Driver::create([
        'name' => 'Akram Gill',
        'phone' => '03456789012',
        'status' => DriverStatus::Available,
    ]);

    $matcher = app(FleetAutoMatcherService::class);

    // Ingest WhatsApp message requesting Fortuner
    $request = $matcher->ingestInbound(
        '03123456789',
        'Hi, I need a Fortuner with driver for 2 days starting tomorrow.',
        'Zubair Hassan',
        'whatsapp'
    );

    expect($request->status)->toBe(RequestStatus::Matched);
    expect($request->suggested_vehicle_id)->toBe($vehicle->id);
    expect($request->suggested_driver_id)->toBe($driver->id);

    // 1-Click Convert
    $result = $matcher->convert($request, [
        'client_name' => 'Zubair Hassan',
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'pricing_mode' => PricingMode::Daily->value,
        'start_date' => '2026-10-10',
    ]);

    expect($result['booking'])->toBeInstanceOf(Booking::class);
    expect($request->fresh()->status)->toBe(RequestStatus::Converted);
    expect($vehicle->fresh()->status)->toBe(VehicleStatus::Rented);
});

test('expired trial write gating blocks mutation while allowing read queries', function () {
    // 1. While on trial: POST succeeds
    $response = $this->actingAs($this->user)->post(route('rental.vehicles.store'), [
        'plate_number' => 'LHE-23-1100',
        'model' => 'Suzuki Cultus VXL',
        'year' => 2023,
        'daily_rate' => 4500,
        'mileage' => 10000,
        'status' => 'available',
    ]);
    expect($response->status())->toBe(302); // Redirect back on success

    // 2. Expire trial to read_only
    $this->tenant->update([
        'subscription_status' => 'read_only',
        'trial_ends_at' => now()->subDay(),
    ]);
    tenancy()->initialize($this->tenant->fresh());

    // GET still succeeds with 200 (read access preserved)
    $readResponse = $this->actingAs($this->user)->get(route('rental.vehicles.index'));
    expect($readResponse->status())->toBe(200);

    // POST is blocked with 403 Forbidden
    $writeResponse = $this->actingAs($this->user)->post(route('rental.vehicles.store'), [
        'plate_number' => 'LHE-24-2200',
        'model' => 'Suzuki Swift GLX',
        'year' => 2024,
        'daily_rate' => 5500,
        'mileage' => 5000,
        'status' => 'available',
    ]);
    expect($writeResponse->status())->toBe(403);
});

test('pwa my bookings endpoint renders customer bookings and inquiries based on phone', function () {
    $client = Client::create([
        'name' => 'Usman Shahid',
        'phone' => '+923009988776',
    ]);

    $vehicle = Vehicle::create([
        'plate_number' => 'ICT-23-999',
        'model' => 'Honda Civic RS',
        'year' => 2023,
        'daily_rate' => 12000,
        'mileage' => 15000,
        'status' => VehicleStatus::Rented,
    ]);

    $booking = Booking::create([
        'booking_number' => 'BK-TEST-001',
        'client_id' => $client->id,
        'vehicle_id' => $vehicle->id,
        'pricing_mode' => PricingMode::Daily,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
        'status' => BookingStatus::Active,
        'total_cost' => 36000,
    ]);

    $bookingRequest = BookingRequest::create([
        'from_name' => 'Usman Shahid',
        'from_phone' => '+923009988776',
        'message_text' => 'Need a Civic for 3 days',
        'status' => RequestStatus::Matched,
        'suggested_vehicle_id' => $vehicle->id,
    ]);

    $response = $this->get(route('pwa.my-bookings', [
        'tenant_slug' => $this->tenant->id,
        'phone' => '9988776',
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Pwa/MyBookings')
        ->where('customerPhone', '9988776')
        ->has('bookings', 1)
        ->has('requests', 1)
    );
});

test('rental dashboard supplies live requests alongside kpis and pending pickups', function () {
    $request = BookingRequest::create([
        'from_name' => 'Sara Ali',
        'from_phone' => '+923114455667',
        'message_text' => 'Looking for an SUV for Murree trip',
        'status' => RequestStatus::Unmatched,
    ]);

    $response = $this->actingAs($this->user)->get(route('rental.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Rental/Dashboard')
        ->has('liveRequests', 1)
        ->where('liveRequests.0.from_name', 'Sara Ali')
    );
});

