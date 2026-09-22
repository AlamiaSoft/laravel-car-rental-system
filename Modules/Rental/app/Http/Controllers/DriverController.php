<?php

namespace Modules\Rental\Http\Controllers;

use App\Enums\DriverStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Rental\Models\Driver;

class DriverController extends Controller
{
    public function index(): Response
    {
        $drivers = Driver::withCount('bookings')
            ->latest()
            ->get();

        return Inertia::render('Rental/Drivers/Index', [
            'drivers' => $drivers,
        ]);
    }

    public function available(): JsonResponse
    {
        $drivers = Driver::where('status', DriverStatus::Available)
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($drivers);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:30',
            'license_no' => 'nullable|string|max:50',
            'status' => ['nullable', new Enum(DriverStatus::class)],
        ]);

        Driver::create($validated);

        return redirect()->back()->with('success', 'Driver registered successfully.');
    }

    public function update(Request $request, Driver $driver): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:30',
            'license_no' => 'nullable|string|max:50',
            'status' => ['required', new Enum(DriverStatus::class)],
        ]);

        $driver->update($validated);

        return redirect()->back()->with('success', 'Driver details updated.');
    }

    public function destroy(Driver $driver): RedirectResponse
    {
        if ($driver->status === DriverStatus::OnTrip) {
            return redirect()->back()->with('error', 'Cannot delete a driver currently assigned to an active trip.');
        }

        $driver->delete();

        return redirect()->back()->with('success', 'Driver removed from roster.');
    }
}
