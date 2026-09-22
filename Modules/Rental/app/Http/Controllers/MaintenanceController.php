<?php

namespace Modules\Rental\Http\Controllers;

use App\Enums\VehicleStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Rental\Models\MaintenanceLog;
use Modules\Rental\Models\Vehicle;
use Modules\Rental\Services\FleetMaintenanceService;

class MaintenanceController extends Controller
{
    public function __construct(
        protected FleetMaintenanceService $maintenanceService
    ) {}

    public function index(): Response
    {
        $logs = MaintenanceLog::with('vehicle')
            ->latest('service_date')
            ->paginate(15);

        $flaggedVehicles = Vehicle::where('status', VehicleStatus::Maintenance)
            ->get();

        $allVehicles = Vehicle::orderBy('model', 'asc')->get();

        return Inertia::render('Rental/Maintenance/Index', [
            'logs' => $logs,
            'flaggedVehicles' => $flaggedVehicles,
            'vehicles' => $allVehicles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'type' => 'required|string|max:100',
            'mileage_at_service' => 'required|integer|min:0',
            'service_interval_km' => 'nullable|integer|min:500|max:50000',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'service_date' => 'required|date',
        ]);

        $vehicle = Vehicle::findOrFail($validated['vehicle_id']);

        $this->maintenanceService->logService($vehicle, $validated);

        return redirect()->back()->with('success', 'Maintenance service logged. Vehicle restored to Available.');
    }

    public function scan(): RedirectResponse
    {
        $flagged = $this->maintenanceService->scanOverdueVehicles();

        return redirect()->back()->with('success', "Fleet scan complete. {$flagged} vehicle(s) flagged for service.");
    }
}
