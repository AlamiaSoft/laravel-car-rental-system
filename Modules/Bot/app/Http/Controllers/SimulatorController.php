<?php

namespace Modules\Bot\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SimulatorController extends Controller
{
    public function index(Request $request)
    {
        $tenants = Tenant::all()->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'name' => $tenant->name ?? $tenant->id,
            ];
        });

        return Inertia::render('Bot/Simulator', [
            'tenant' => $request->query('tenant'),
            'tenants' => $tenants,
        ]);
    }
}
