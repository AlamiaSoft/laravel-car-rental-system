<?php

namespace Modules\Rental\Models;

use App\Enums\VehicleStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Vehicle extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id',
        'plate_number',
        'model',
        'year',
        'status',
        'mileage',
        'fuel_tank_capacity',
        'gps_device_id',
        'next_service_due_mileage',
        'daily_rate',
        'image_url',
        'photo_metadata',
    ];

    protected $casts = [
        'status' => VehicleStatus::class,
        'year' => 'integer',
        'mileage' => 'integer',
        'fuel_tank_capacity' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'next_service_due_mileage' => 'integer',
        'photo_metadata' => 'array',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === VehicleStatus::Available;
    }

    public function isDueForService(): bool
    {
        return $this->next_service_due_mileage !== null && $this->mileage >= $this->next_service_due_mileage;
    }
}
