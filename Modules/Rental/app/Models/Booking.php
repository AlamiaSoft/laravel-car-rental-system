<?php

namespace Modules\Rental\Models;

use App\Enums\BookingStatus;
use App\Enums\FuelSettlement;
use App\Enums\PricingMode;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Booking extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'rental_bookings';

    protected $fillable = [
        'tenant_id',
        'booking_number',
        'client_id',
        'vehicle_id',
        'driver_id',
        'third_party_vendor_id',
        'pricing_mode',
        'lumpsum_amount',
        'daily_driver_rate',
        'daily_lunch_rate',
        'number_of_days',
        'start_date',
        'end_date',
        'fuel_level_pickup',
        'fuel_level_dropoff',
        'mileage_pickup',
        'mileage_dropoff',
        'fuel_shortfall_fee',
        'fuel_settlement',
        'status',
        'total_cost',
        'notes',
    ];

    protected $casts = [
        'pricing_mode' => PricingMode::class,
        'fuel_settlement' => FuelSettlement::class,
        'status' => BookingStatus::class,
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'lumpsum_amount' => 'decimal:2',
        'daily_driver_rate' => 'decimal:2',
        'daily_lunch_rate' => 'decimal:2',
        'fuel_shortfall_fee' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'number_of_days' => 'integer',
        'fuel_level_pickup' => 'integer',
        'fuel_level_dropoff' => 'integer',
        'mileage_pickup' => 'integer',
        'mileage_dropoff' => 'integer',
    ];

    protected static function booted()
    {
        static::creating(function ($booking) {
            if (empty($booking->booking_number)) {
                $booking->booking_number = 'RN-'.strtoupper(bin2hex(random_bytes(4)));
            }
        });
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class, 'driver_id');
    }

    public function thirdPartyVendor(): BelongsTo
    {
        return $this->belongsTo(ThirdPartyVendor::class, 'third_party_vendor_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(RentalPayment::class, 'booking_id');
    }
}
