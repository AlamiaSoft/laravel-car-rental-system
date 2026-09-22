<?php

namespace Modules\Bot\Models;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppConnection extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_connections';

    protected $fillable = [
        'tenant_id',
        'provider',
        'instance_name',
        'instance_token',
        'phone_number',
        'status',
        'evolution_instance_id',
        'qrcode',
        'connected_at',
        'last_seen_at',
        'metadata',
    ];

    protected $casts = [
        'instance_token' => 'encrypted',
        'metadata' => 'array',
        'connected_at' => 'datetime',
        'last_seen_at' => 'datetime',
    ];

    /**
     * Relationship with Tenant.
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
