<?php

namespace Modules\Bot\Services;

use App\Models\Tenant;
use Modules\Bot\Models\WhatsAppConnection;
use Modules\Bot\Services\Contracts\WhatsAppProvider;
use Modules\Bot\Services\Providers\EvolutionApiProvider;
use Modules\Bot\Services\Providers\MetaCloudProvider;

class WhatsAppProviderResolver
{
    /**
     * Resolve the active WhatsAppProvider for the tenant.
     */
    public static function resolve(Tenant $tenant): WhatsAppProvider
    {
        // Check if there is an active Evolution connection
        $connection = WhatsAppConnection::where('tenant_id', $tenant->id)
            ->where('provider', 'evolution')
            ->first();

        if ($connection && $connection->status === 'open') {
            return new EvolutionApiProvider($connection);
        }

        // Fallback to Meta Cloud Provider
        return new MetaCloudProvider($tenant);
    }
}
