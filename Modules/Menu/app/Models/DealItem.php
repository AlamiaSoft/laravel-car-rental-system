<?php

namespace Modules\Menu\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// use Modules\Menu\Database\Factories\DealItemFactory;

class DealItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = ['deal_id', 'product_id', 'quantity'];

    // protected static function newFactory(): DealItemFactory
    // {
    //     // return DealItemFactory::new();
    // }
}
