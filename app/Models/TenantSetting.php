<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantSetting extends Model
{
    protected $fillable = [
        'tenant_id',
        'status',
        'branding',
        'ordering',
        'payments',
        'whatsapp',
        'crm',
    ];

    protected $casts = [
        'branding' => 'array',
        'ordering' => 'array',
        'payments' => 'array',
        'whatsapp' => 'array',
        'crm' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
