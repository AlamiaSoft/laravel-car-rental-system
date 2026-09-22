<?php

namespace Modules\Rental\Http\Controllers;

use App\Enums\VehicleStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Rental\Models\Vehicle;
use Modules\Rental\Services\PexelsPhotoService;

class VehicleController extends Controller
{
    public function __construct(
        protected PexelsPhotoService $pexelsService
    ) {}

    public function index(): Response
    {
        $vehicles = Vehicle::withCount('maintenanceLogs')
            ->latest()
            ->get();

        return Inertia::render('Rental/Vehicles/Index', [
            'vehicles' => $vehicles,
        ]);
    }

    public function available(): JsonResponse
    {
        $vehicles = Vehicle::where('status', VehicleStatus::Available)
            ->orderBy('model', 'asc')
            ->get();

        return response()->json($vehicles);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = tenant('id');

        $validated = $request->validate([
            'plate_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('vehicles', 'plate_number')->where('tenant_id', $tenantId),
            ],
            'model' => 'required|string|max:100',
            'year' => 'nullable|integer|min:1980|max:'.(date('Y') + 1),
            'status' => ['nullable', new Enum(VehicleStatus::class)],
            'mileage' => 'nullable|integer|min:0',
            'fuel_tank_capacity' => 'nullable|numeric|min:1|max:200',
            'gps_device_id' => 'nullable|string|max:100',
            'next_service_due_mileage' => 'nullable|integer|min:0',
            'daily_rate' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|url|max:500',
        ]);

        // Auto-resolve real Pexels vehicle photo if not provided
        if (empty($validated['image_url'])) {
            $pexelsData = $this->pexelsService->resolveForVehicleModel($validated['model']);
            $validated['image_url'] = $pexelsData['image_url'];
            $validated['photo_metadata'] = $pexelsData['photo_metadata'];
        }

        Vehicle::create($validated);

        return redirect()->back()->with('success', 'Vehicle added to fleet successfully.');
    }

    public function update(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $tenantId = tenant('id');

        $validated = $request->validate([
            'plate_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('vehicles', 'plate_number')->ignore($vehicle->id)->where('tenant_id', $tenantId),
            ],
            'model' => 'required|string|max:100',
            'year' => 'nullable|integer|min:1980|max:'.(date('Y') + 1),
            'status' => ['nullable', new Enum(VehicleStatus::class)],
            'mileage' => 'nullable|integer|min:0',
            'fuel_tank_capacity' => 'nullable|numeric|min:1|max:200',
            'gps_device_id' => 'nullable|string|max:100',
            'next_service_due_mileage' => 'nullable|integer|min:0',
            'daily_rate' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|url|max:500',
        ]);

        if (empty($validated['image_url']) && empty($vehicle->image_url)) {
            $pexelsData = $this->pexelsService->resolveForVehicleModel($validated['model']);
            $validated['image_url'] = $pexelsData['image_url'];
            $validated['photo_metadata'] = $pexelsData['photo_metadata'];
        }

        $vehicle->update($validated);

        return redirect()->back()->with('success', 'Vehicle updated successfully.');
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        if ($vehicle->status === VehicleStatus::Rented) {
            return redirect()->back()->with('error', 'Cannot delete a vehicle that is currently rented.');
        }

        $vehicle->delete();

        return redirect()->back()->with('success', 'Vehicle removed from fleet.');
    }
}
