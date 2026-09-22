<?php

namespace Modules\Crm\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

// use Modules\Crm\Database\Factories\CustomerFactory;

class Customer extends Model
{
    use BelongsToTenant, HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'phone',
        'total_orders',
        'total_spent',
        'last_order_date',
    ];

    public function addresses()
    {
        return $this->hasMany(CustomerAddress::class);
    }

    // protected static function newFactory(): CustomerFactory
    // {
    //     // return CustomerFactory::new();
    // }
}
