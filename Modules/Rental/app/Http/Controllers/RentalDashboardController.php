<?php

namespace Modules\Rental\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\DriverStatus;
use App\Enums\RequestStatus;
use App\Enums\VehicleStatus;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Rental\Models\Booking;
use Modules\Rental\Models\BookingRequest;
use Modules\Rental\Models\Driver;
use Modules\Rental\Models\Vehicle;

class RentalDashboardController extends Controller
{
    public function index(): Response
    {
        $tenant = tenant();

        $activeRentals = Booking::where('status', BookingStatus::Active)->count();
        $availableVehicles = Vehicle::where('status', VehicleStatus::Available)->count();
        $totalVehicles = Vehicle::count();
        $maintenanceVehicles = Vehicle::where('status', VehicleStatus::Maintenance)->count();
        $freeDrivers = Driver::where('status', DriverStatus::Available)->count();
        $totalDrivers = Driver::count();
        $openRequests = BookingRequest::whereIn('status', [RequestStatus::Matched, RequestStatus::Unmatched])->count();

        $completedMonthRevenue = (float) Booking::where('status', BookingStatus::Completed)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_cost');

        $recentBookings = Booking::with(['client', 'vehicle', 'driver', 'thirdPartyVendor'])
            ->latest()
            ->take(6)
            ->get();

        $pendingPickups = Booking::with(['client', 'vehicle', 'driver'])
            ->where('status', BookingStatus::Pending)
            ->orderBy('start_date', 'asc')
            ->take(5)
            ->get();

        $liveRequests = BookingRequest::with(['suggestedVehicle', 'suggestedDriver'])
            ->whereIn('status', [RequestStatus::Matched, RequestStatus::Unmatched])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Rental/Dashboard', [
            'kpis' => [
                'active_rentals' => $activeRentals,
                'available_vehicles' => $availableVehicles,
                'total_vehicles' => $totalVehicles,
                'maintenance_vehicles' => $maintenanceVehicles,
                'free_drivers' => $freeDrivers,
                'total_drivers' => $totalDrivers,
                'open_requests' => $openRequests,
                'month_revenue' => $completedMonthRevenue,
            ],
            'recentBookings' => $recentBookings,
            'pendingPickups' => $pendingPickups,
            'liveRequests' => $liveRequests,
            'daysLeftInTrial' => $tenant?->daysLeftInTrial(),
            'isReadOnly' => $tenant?->isReadOnly() ?? false,
        ]);
    }
}
