<?php

namespace Modules\Bot\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// use Modules\Bot\Database\Factories\BotSessionFactory;

class BotSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone_number',
        'tenant_id',
        'workflow_id',
        'current_state',
        'current_node_key',
        'context',
        'expires_at',
    ];

    protected $casts = [
        'context' => 'array',
        'expires_at' => 'datetime',
    ];

    public function workflow()
    {
        return $this->belongsTo(BotWorkflow::class, 'workflow_id');
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
