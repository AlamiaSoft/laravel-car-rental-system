<?php

namespace Modules\Rental\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Client extends Model
{
    use BelongsToTenant, HasFactory;

    protected $table = 'rental_clients';

    protected $fillable = [
        'tenant_id',
        'name',
        'phone',
        'cnic',
        'license_doc_url',
        'notes',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
