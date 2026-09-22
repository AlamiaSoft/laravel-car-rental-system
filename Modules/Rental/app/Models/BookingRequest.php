<?php

namespace Modules\Rental\Models;

use App\Enums\RequestStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class BookingRequest extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'booking_requests';

    protected $fillable = [
        'tenant_id',
        'source',
        'from_phone',
        'from_name',
        'message_text',
        'suggested_vehicle_id',
        'suggested_driver_id',
        'status',
        'booking_id',
    ];

    protected $casts = [
        'status' => RequestStatus::class,
    ];

    public function suggestedVehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'suggested_vehicle_id');
    }

    public function suggestedDriver(): BelongsTo
    {
        return $this->belongsTo(Driver::class, 'suggested_driver_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
