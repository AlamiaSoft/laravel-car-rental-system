<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InitializeTenancy
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        \Log::info('InitializeTenancy ran', [
            'auth_check' => auth()->check(),
            'user' => auth()->user(),
        ]);

        if (auth()->check() && auth()->user()->tenant_id) {
            try {
                tenancy()->initialize(auth()->user()->tenant_id);
                \Log::info('Tenancy initialized', ['tenant' => tenant('id')]);
            } catch (\Throwable $e) {
                \Log::warning('Failed to initialize tenancy for tenant: ' . auth()->user()->tenant_id . ' - ' . $e->getMessage());
            }
        }

        return $next($request);
    }
}
