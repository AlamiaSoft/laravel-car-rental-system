<?php

namespace Modules\Rental\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class RentalPayment extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'rental_payments';

    protected $fillable = [
        'tenant_id',
        'booking_id',
        'amount',
        'method',
        'status',
        'transaction_ref',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
