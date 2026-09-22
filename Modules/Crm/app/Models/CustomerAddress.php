<?php

namespace Modules\Crm\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// use Modules\Crm\Database\Factories\CustomerAddressFactory;

class CustomerAddress extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'customer_id',
        'label',
        'address',
        'latitude',
        'longitude',
        'delivery_notes',
        'is_default',
        'last_used_at',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // protected static function newFactory(): CustomerAddressFactory
    // {
    //     // return CustomerAddressFactory::new();
    // }
}
