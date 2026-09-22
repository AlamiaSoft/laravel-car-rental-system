<?php

namespace Modules\Menu\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use Modules\Menu\Database\Factories\CategoryFactory;

use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Category extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = ['name', 'description', 'is_active'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // protected static function newFactory(): CategoryFactory
    // {
    //     // return CategoryFactory::new();
    // }
}
