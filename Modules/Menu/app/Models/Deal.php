<?php

namespace Modules\Menu\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use Modules\Menu\Database\Factories\DealFactory;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Deal extends Model
{
    use BelongsToTenant, HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = ['name', 'description', 'price', 'image_url', 'is_active'];

    // protected static function newFactory(): DealFactory
    // {
    //     // return DealFactory::new();
    // }
}
