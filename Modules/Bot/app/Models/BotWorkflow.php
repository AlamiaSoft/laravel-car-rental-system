<?php

namespace Modules\Bot\Models;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BotWorkflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'is_active',
        'trigger_keywords',
        'nodes_schema',
        'edges_schema',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'trigger_keywords' => 'array',
        'nodes_schema' => 'array',
        'edges_schema' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeGlobalTemplates($query)
    {
        return $query->whereNull('tenant_id');
    }
}
