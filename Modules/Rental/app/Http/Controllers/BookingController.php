<?php

namespace Modules\Rental\Http\Controllers;

use App\Enums\DriverStatus;
use App\Enums\FuelSettlement;
use App\Enums\PricingMode;
use App\Enums\VehicleStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Rental\Models\Booking;
use Modules\Rental\Models\Client;
use Modules\Rental\Models\Driver;
use Modules\Rental\Models\ThirdPartyVendor;
use Modules\Rental\Models\Vehicle;
use Modules\Rental\Services\BookingLifecycleService;

class BookingController extends Controller
{
    public function __construct(
        protected BookingLifecycleService $lifecycleService
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->query('status', 'all');

        $query = Booking::with(['client', 'vehicle', 'driver', 'thirdPartyVendor', 'payments'])
            ->latest();

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $bookings = $query->paginate(15)->withQueryString();

        $availableVehicles = Vehicle::where('status', VehicleStatus::Available)->get();
        $availableDrivers = Driver::where('status', DriverStatus::Available)->get();
        $clients = Client::orderBy('name', 'asc')->get();
        $vendors = ThirdPartyVendor::orderBy('vendor_name', 'asc')->get();

        return Inertia::render('Rental/Bookings/Index', [
            'bookings' => $bookings,
            'statusFilter' => $status,
            'availableVehicles' => $availableVehicles,
            'availableDrivers' => $availableDrivers,
            'clients' => $clients,
            'vendors' => $vendors,
        ]);
    }

    public function create(): Response
    {
        $vehicles = Vehicle::where('status', VehicleStatus::Available)->get();
        $drivers = Driver::where('status', DriverStatus::Available)->get();
        $clients = Client::orderBy('name', 'asc')->get();
        $vendors = ThirdPartyVendor::orderBy('vendor_name', 'asc')->get();

        return Inertia::render('Rental/Bookings/Create', [
            'vehicles' => $vehicles,
            'drivers' => $drivers,
            'clients' => $clients,
            'vendors' => $vendors,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:rental_clients,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'driver_id' => 'nullable|exists:drivers,id',
            'third_party_vendor_id' => 'nullable|exists:third_party_vendors,id',
            'pricing_mode' => ['required', new Enum(PricingMode::class)],
            'lumpsum_amount' => 'nullable|numeric|min:0',
            'daily_driver_rate' => 'nullable|numeric|min:0',
            'daily_lunch_rate' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $this->lifecycleService->create($validated);

        return redirect()->route('rental.bookings.index')->with('success', 'Rental booking reserved successfully.');
    }

    public function pickup(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'fuel_level_pickup' => 'required|integer|min:0|max:100',
            'mileage_pickup' => 'required|integer|min:0',
        ]);

        try {
            $this->lifecycleService->pickup(
                $booking,
                $validated['fuel_level_pickup'],
                $validated['mileage_pickup']
            );

            return redirect()->back()->with('success', 'Vehicle handover complete. Booking is now Active.');
        } catch (\DomainException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function dropoff(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'fuel_level_dropoff' => 'required|integer|min:0|max:100',
            'mileage_dropoff' => 'required|integer|min:0',
            'fuel_settlement' => ['required', new Enum(FuelSettlement::class)],
        ]);

        try {
            $this->lifecycleService->dropoff(
                $booking,
                $validated['fuel_level_dropoff'],
                $validated['mileage_dropoff'],
                $validated['fuel_settlement']
            );

            return redirect()->back()->with('success', 'Vehicle return processed and pricing finalized.');
        } catch (\DomainException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        try {
            $this->lifecycleService->cancel($booking);

            return redirect()->back()->with('success', 'Booking cancelled and fleet released.');
        } catch (\DomainException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
