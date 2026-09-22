<?php

namespace App\Models;

use App\Enums\TenantCapability;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantCapabilityModel extends Model
{
    protected $table = 'tenant_capabilities';

    protected $fillable = [
        'tenant_id',
        'capability',
    ];

    protected function casts(): array
    {
        return [
            'capability' => TenantCapability::class,
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
