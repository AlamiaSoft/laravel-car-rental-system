<?php

namespace Modules\Rental\Services;

use App\Enums\VehicleStatus;
use Modules\Rental\Models\MaintenanceLog;
use Modules\Rental\Models\Vehicle;

class FleetMaintenanceService
{
    public const DEFAULT_SERVICE_INTERVAL_KM = 5000;

    /**
     * Record a completed service log and reset vehicle status to Available.
     */
    public function logService(Vehicle $vehicle, array $data): MaintenanceLog
    {
        $serviceMileage = $data['mileage_at_service'] ?? $vehicle->mileage;
        $intervalKm = $data['service_interval_km'] ?? self::DEFAULT_SERVICE_INTERVAL_KM;
        $nextDueMileage = $data['next_due_mileage'] ?? ($serviceMileage + $intervalKm);

        $log = MaintenanceLog::create([
            'vehicle_id' => $vehicle->id,
            'type' => $data['type'] ?? 'general_service',
            'mileage_at_service' => $serviceMileage,
            'next_due_mileage' => $nextDueMileage,
            'cost' => $data['cost'] ?? 0.00,
            'notes' => $data['notes'] ?? null,
            'service_date' => $data['service_date'] ?? now(),
        ]);

        $vehicle->update([
            'mileage' => max($vehicle->mileage, $serviceMileage),
            'next_service_due_mileage' => $nextDueMileage,
            'status' => VehicleStatus::Available,
        ]);

        return $log;
    }

    /**
     * Scan fleet for vehicles whose odometer has crossed the next service threshold.
     */
    public function scanOverdueVehicles(): int
    {
        $overdueVehicles = Vehicle::where('status', '!=', VehicleStatus::Maintenance)
            ->whereNotNull('next_service_due_mileage')
            ->whereColumn('mileage', '>=', 'next_service_due_mileage')
            ->get();

        $count = 0;
        foreach ($overdueVehicles as $vehicle) {
            $vehicle->update(['status' => VehicleStatus::Maintenance]);
            $count++;
        }

        return $count;
    }
}
