<?php

namespace Modules\Orders\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use Modules\Orders\Database\Factories\OrderItemFactory;

use Modules\Menu\Models\Product;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class OrderItem extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'order_id', 'product_id', 'quantity', 'unit_price', 'subtotal',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // protected static function newFactory(): OrderItemFactory
    // {
    //     // return OrderItemFactory::new();
    // }
}
