<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalTenants = Tenant::count();
        $totalUsers = User::count();

        return Inertia::render('Admin/Dashboard', [
            'kpis' => [
                'totalTenants' => $totalTenants,
                'totalUsers' => $totalUsers,
            ],
        ]);
    }
}
