<?php

namespace Modules\Rental\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class MaintenanceLog extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'maintenance_logs';

    protected $fillable = [
        'tenant_id',
        'vehicle_id',
        'type',
        'mileage_at_service',
        'next_due_mileage',
        'cost',
        'notes',
        'service_date',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'mileage_at_service' => 'integer',
        'next_due_mileage' => 'integer',
        'service_date' => 'datetime',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }
}
