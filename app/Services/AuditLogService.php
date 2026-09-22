<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Record an audit log entry for the current tenant context.
     */
    public static function log(
        string $action,
        Model|string|null $entity = null,
        ?array $payload = null,
        ?string $tenantId = null
    ): AuditLog {
        $resolvedTenantId = $tenantId ?? (tenant() ? tenant('id') : null);
        $userId = auth()->check() ? auth()->id() : null;

        $entityType = null;
        $entityId = null;

        if ($entity instanceof Model) {
            $entityType = get_class($entity);
            $entityId = (string) $entity->getKey();
        } elseif (is_string($entity)) {
            $entityType = $entity;
        }

        return AuditLog::create([
            'tenant_id' => $resolvedTenantId,
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'payload' => $payload,
            'ip_address' => Request::ip(),
        ]);
    }
}
