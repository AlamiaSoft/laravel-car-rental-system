<?php

namespace Modules\Rental\Services;

use App\Enums\BookingStatus;
use App\Enums\DriverStatus;
use App\Enums\FuelSettlement;
use App\Enums\PricingMode;
use App\Enums\VehicleStatus;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;
use Modules\Rental\Models\Booking;
use Modules\Rental\Models\Driver;
use Modules\Rental\Models\Vehicle;

class BookingLifecycleService
{
    public function __construct(
        protected RentalPricingService $pricingService
    ) {}

    /**
     * Create a new booking and reserve assigned vehicle & driver.
     */
    public function create(array $data): Booking
    {
        $vehicleId = $data['vehicle_id'] ?? null;
        $driverId = $data['driver_id'] ?? null;
        $thirdPartyVendorId = $data['third_party_vendor_id'] ?? null;

        if (! $vehicleId && ! $thirdPartyVendorId) {
            throw ValidationException::withMessages([
                'vehicle_id' => 'A booking must have either an owned fleet vehicle or a third-party vendor.',
            ]);
        }

        $vehicle = null;
        if ($vehicleId) {
            $vehicle = Vehicle::find($vehicleId);
            if (! $vehicle) {
                throw ValidationException::withMessages(['vehicle_id' => 'Vehicle not found.']);
            }
            if ($vehicle->status !== VehicleStatus::Available) {
                throw ValidationException::withMessages(['vehicle_id' => 'Vehicle is not currently available.']);
            }
        }

        $driver = null;
        if ($driverId) {
            $driver = Driver::find($driverId);
            if (! $driver) {
                throw ValidationException::withMessages(['driver_id' => 'Driver not found.']);
            }
            if ($driver->status !== DriverStatus::Available) {
                throw ValidationException::withMessages(['driver_id' => 'Driver is not currently available.']);
            }
        }

        $pricingMode = $data['pricing_mode'] instanceof PricingMode
            ? $data['pricing_mode']
            : PricingMode::from($data['pricing_mode']);

        $booking = Booking::create([
            'client_id' => $data['client_id'],
            'vehicle_id' => $vehicleId,
            'driver_id' => $driverId,
            'third_party_vendor_id' => $thirdPartyVendorId,
            'pricing_mode' => $pricingMode,
            'lumpsum_amount' => $pricingMode === PricingMode::Lumpsum ? ($data['lumpsum_amount'] ?? null) : null,
            'daily_driver_rate' => $data['daily_driver_rate'] ?? 6000.00,
            'daily_lunch_rate' => $data['daily_lunch_rate'] ?? 500.00,
            'start_date' => $data['start_date'] ?? now(),
            'notes' => $data['notes'] ?? null,
            'status' => BookingStatus::Pending,
        ]);

        // Lock vehicle and driver to prevent concurrent double-booking
        if ($vehicle) {
            $vehicle->update(['status' => VehicleStatus::Rented]);
        }
        if ($driver) {
            $driver->update(['status' => DriverStatus::OnTrip]);
        }

        return $booking->fresh(['client', 'vehicle', 'driver', 'thirdPartyVendor']);
    }

    /**
     * Handover / Pickup step: record starting fuel & mileage, activate booking.
     */
    public function pickup(Booking $booking, int $fuelLevelPickup, int $mileagePickup): Booking
    {
        if ($booking->status !== BookingStatus::Pending) {
            throw new \DomainException('Only pending bookings can be picked up.');
        }

        $booking->update([
            'fuel_level_pickup' => $fuelLevelPickup,
            'mileage_pickup' => $mileagePickup,
            'status' => BookingStatus::Active,
        ]);

        if ($booking->vehicle && $booking->vehicle->status !== VehicleStatus::Rented) {
            $booking->vehicle->update(['status' => VehicleStatus::Rented]);
        }
        if ($booking->driver && $booking->driver->status !== DriverStatus::OnTrip) {
            $booking->driver->update(['status' => DriverStatus::OnTrip]);
        }

        return $booking->fresh();
    }

    /**
     * Return / Drop-off step: record ending fuel & mileage, calculate settlement, finalize pricing, release resources.
     */
    public function dropoff(
        Booking $booking,
        int $fuelLevelDropoff,
        int $mileageDropoff,
        FuelSettlement|string $settlement = FuelSettlement::ChargedToBill,
        ?Carbon $dropoffTime = null
    ): Booking {
        if ($booking->status !== BookingStatus::Active) {
            throw new \DomainException('Only active bookings can be dropped off.');
        }

        $fuelSettlement = $settlement instanceof FuelSettlement
            ? $settlement
            : FuelSettlement::from($settlement);

        $now = $dropoffTime ?? now();
        $numberOfDays = $this->pricingService->calculateNumberOfDays($booking->start_date, $now);

        $fuelShortfallFee = 0.00;
        if (
            $booking->pricing_mode === PricingMode::Daily &&
            $booking->fuel_level_pickup !== null &&
            $fuelSettlement !== FuelSettlement::RefilledByClient
        ) {
            $fuelShortfallFee = $this->pricingService->calculateFuelShortfallFee(
                $booking->fuel_level_pickup,
                $fuelLevelDropoff,
                $booking->vehicle
            );
        }

        // Only add shortfall fee to the customer invoice if settlement is ChargedToBill
        $shortfallOnBill = ($fuelSettlement === FuelSettlement::ChargedToBill) ? $fuelShortfallFee : 0.00;

        $totalCost = $this->pricingService->calculateTotalCost(
            $booking->pricing_mode,
            $booking->lumpsum_amount ? (float) $booking->lumpsum_amount : null,
            (float) $booking->daily_driver_rate,
            (float) $booking->daily_lunch_rate,
            $numberOfDays,
            $shortfallOnBill
        );

        $booking->update([
            'end_date' => $now,
            'fuel_level_dropoff' => $fuelLevelDropoff,
            'mileage_dropoff' => $mileageDropoff,
            'number_of_days' => $numberOfDays,
            'fuel_shortfall_fee' => $fuelShortfallFee,
            'fuel_settlement' => $fuelSettlement,
            'total_cost' => $totalCost,
            'status' => BookingStatus::Completed,
        ]);

        // Release vehicle & auto-flag for maintenance if mileage exceeded threshold
        if ($booking->vehicle_id && $booking->vehicle) {
            $vehicle = $booking->vehicle;
            $updatedMileage = max($vehicle->mileage, $mileageDropoff);
            $dueForMaintenance = $vehicle->next_service_due_mileage !== null && $updatedMileage >= $vehicle->next_service_due_mileage;

            $vehicle->update([
                'mileage' => $updatedMileage,
                'status' => $dueForMaintenance ? VehicleStatus::Maintenance : VehicleStatus::Available,
            ]);
        }

        // Release driver back to available
        if ($booking->driver_id && $booking->driver) {
            $booking->driver->update(['status' => DriverStatus::Available]);
        }

        return $booking->fresh(['client', 'vehicle', 'driver', 'thirdPartyVendor', 'payments']);
    }

    /**
     * Cancel booking and release reserved fleet & driver.
     */
    public function cancel(Booking $booking): Booking
    {
        if ($booking->status === BookingStatus::Completed) {
            throw new \DomainException('A completed booking cannot be cancelled.');
        }

        $booking->update(['status' => BookingStatus::Cancelled]);

        if ($booking->vehicle_id && $booking->vehicle) {
            $booking->vehicle->update(['status' => VehicleStatus::Available]);
        }
        if ($booking->driver_id && $booking->driver) {
            $booking->driver->update(['status' => DriverStatus::Available]);
        }

        return $booking->fresh();
    }
}
