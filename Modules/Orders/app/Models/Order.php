<?php

namespace Modules\Orders\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use Modules\Orders\Database\Factories\OrderFactory;

use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Order extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id', 'order_number', 'customer_phone', 'customer_name',
        'total_amount', 'status', 'order_type', 'delivery_address', 'table_number', 'type', 'source',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // protected static function newFactory(): OrderFactory
    // {
    //     // return OrderFactory::new();
    // }
}
