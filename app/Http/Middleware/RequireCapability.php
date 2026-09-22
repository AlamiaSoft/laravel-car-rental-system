<?php

namespace App\Http\Middleware;

use App\Enums\TenantCapability;
use App\Exceptions\CapabilityNotEnabledException;
use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireCapability
{
    /**
     * Handle an incoming request.
     *
     * The canonical enforcement layer for capability-gated routes.
     * Usage: Route::middleware('capability:booking')->group(...)
     */
    public function handle(Request $request, Closure $next, string $capability): Response
    {
        $tenantCapability = TenantCapability::tryFrom($capability);

        if (! $tenantCapability) {
            abort(500, "Unknown capability: {$capability}");
        }

        $tenant = tenant();

        if (! $tenant && $request->route('tenant_slug')) {
            $tenant = Tenant::find($request->route('tenant_slug'));
            if ($tenant && $tenant->is_active) {
                tenancy()->initialize($tenant);
            }
        }

        if (! $tenant) {
            abort(403, 'No active tenant.');
        }

        if (! $tenant->hasCapability($tenantCapability)) {
            throw new CapabilityNotEnabledException($tenantCapability);
        }

        return $next($request);
    }
}
