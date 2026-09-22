<?php

namespace Modules\Rental\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class ThirdPartyVendor extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'third_party_vendors';

    protected $fillable = [
        'tenant_id',
        'vendor_name',
        'contact',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
