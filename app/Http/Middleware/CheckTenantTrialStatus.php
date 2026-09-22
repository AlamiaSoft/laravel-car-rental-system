<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTenantTrialStatus
{
    /**
     * Handled write methods blocked during read-only status.
     */
    protected array $writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    /**
     * Route names exempted from write-gating (e.g. subscribing or logging out).
     */
    protected array $exemptRoutes = [
        'logout',
        'settings.billing',
        'settings.billing.*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();
        if (! $tenant) {
            return $next($request);
        }

        // Allow all read methods
        if (! in_array($request->method(), $this->writeMethods, true)) {
            return $next($request);
        }

        // Allow exempted routes
        foreach ($this->exemptRoutes as $exempt) {
            if ($request->routeIs($exempt)) {
                return $next($request);
            }
        }

        if ($tenant->isReadOnly()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Your 15-day trial has expired and your account is currently in Read-Only mode. Please subscribe to continue creating or modifying records.',
                    'read_only' => true,
                    'billing_url' => route('settings.billing'),
                ], 403);
            }

            abort(403, 'Your 15-day trial has expired and your account is currently in Read-Only mode. Please subscribe to continue creating or modifying records.');
        }

        return $next($request);
    }
}
