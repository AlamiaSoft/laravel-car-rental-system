<?php

namespace Modules\Rental\Http\Controllers;

use App\Enums\PricingMode;
use App\Enums\RequestStatus;
use App\Enums\VehicleStatus;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Rental\Models\Booking;
use Modules\Rental\Models\BookingRequest;
use Modules\Rental\Models\Driver;
use Modules\Rental\Models\ThirdPartyVendor;
use Modules\Rental\Models\Vehicle;
use Modules\Rental\Services\FleetAutoMatcherService;

class BookingRequestController extends Controller
{
    public function __construct(
        protected FleetAutoMatcherService $matcherService
    ) {}

    public function index(): Response
    {
        $requests = BookingRequest::with(['suggestedVehicle', 'suggestedDriver', 'booking.client'])
            ->latest()
            ->paginate(20);

        $availableVehicles = Vehicle::where('status', VehicleStatus::Available)->get();
        $availableDrivers = Driver::where('status', 'available')->get();
        $vendors = ThirdPartyVendor::orderBy('vendor_name', 'asc')->get();

        return Inertia::render('Rental/Requests/Index', [
            'requests' => $requests,
            'availableVehicles' => $availableVehicles,
            'availableDrivers' => $availableDrivers,
            'vendors' => $vendors,
            'stats' => [
                'matched' => BookingRequest::where('status', RequestStatus::Matched)->count(),
                'unmatched' => BookingRequest::where('status', RequestStatus::Unmatched)->count(),
                'converted' => BookingRequest::where('status', RequestStatus::Converted)->count(),
            ],
        ]);
    }

    /**
     * Simulator action: trigger incoming WhatsApp booking inquiry for testing.
     */
    public function simulate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'from_phone' => 'required|string|max:30',
            'from_name' => 'nullable|string|max:100',
            'message_text' => 'required|string|max:1000',
        ]);

        $this->matcherService->ingestInbound(
            $validated['from_phone'],
            $validated['message_text'],
            $validated['from_name'] ?? null,
            'whatsapp_simulator'
        );

        return redirect()->back()->with('success', 'Inbound WhatsApp request simulated and auto-matched.');
    }

    public function rematch(BookingRequest $bookingRequest): RedirectResponse
    {
        try {
            $this->matcherService->rematch($bookingRequest);

            return redirect()->back()->with('success', 'Auto-matching re-evaluated against latest fleet availability.');
        } catch (\DomainException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function convert(Request $request, BookingRequest $bookingRequest): RedirectResponse
    {
        $validated = $request->validate([
            'client_name' => 'nullable|string|max:100',
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

        try {
            $this->matcherService->convert($bookingRequest, $validated);

            return redirect()->back()->with('success', 'Request converted into confirmed booking.');
        } catch (\DomainException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function reject(BookingRequest $bookingRequest): RedirectResponse
    {
        try {
            $this->matcherService->reject($bookingRequest);

            return redirect()->back()->with('success', 'Request rejected.');
        } catch (\DomainException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function pwaStore(Request $request, string $tenant_slug)
    {
        $tenant = Tenant::find($tenant_slug);
        if (! $tenant || ! $tenant->is_active) {
            return response()->json(['message' => 'Car rental business not found.'], 404);
        }
        tenancy()->initialize($tenant);

        $validated = $request->validate([
            'customer_name' => 'required|string|max:100',
            'customer_phone' => 'required|string|max:30',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $vehicle = ! empty($validated['vehicle_id']) ? Vehicle::find($validated['vehicle_id']) : null;
        $vehicleInfo = $vehicle ? "for {$vehicle->model} ({$vehicle->plate_number})" : 'for general rental';
        $datesInfo = (! empty($validated['start_date']) && ! empty($validated['end_date'])) ? " from {$validated['start_date']} to {$validated['end_date']}" : '';
        $notes = ! empty($validated['notes']) ? ". Note: {$validated['notes']}" : '';

        $inboundText = "PWA Booking Request {$vehicleInfo}{$datesInfo}{$notes}";

        $bookingRequest = $this->matcherService->ingestInbound(
            $validated['customer_phone'],
            $inboundText,
            $validated['customer_name'],
            'pwa_miniapp'
        );

        if ($vehicle && $vehicle->status === VehicleStatus::Available) {
            $bookingRequest->update([
                'suggested_vehicle_id' => $vehicle->id,
                'status' => RequestStatus::Matched,
            ]);
        }

        session(['pwa_customer_phone' => $validated['customer_phone']]);
        session(['pwa_customer_name' => $validated['customer_name']]);

        return response()->json([
            'success' => true,
            'message' => 'Your rental request has been received! Our dispatch team will contact you shortly.',
            'request_id' => $bookingRequest->id,
            'redirect_url' => route('pwa.my-bookings', ['tenant_slug' => $tenant_slug, 'phone' => $validated['customer_phone']]),
        ]);
    }

    /**
     * Customer PWA screen: view active, pending, and past bookings/requests.
     */
    public function pwaMyBookings(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::find($tenant_slug);
        if (! $tenant || ! $tenant->is_active) {
            abort(404, 'Car rental business not found.');
        }
        tenancy()->initialize($tenant);

        $phone = $request->query('phone') ?? session('pwa_customer_phone');
        $cleanPhone = $phone ? preg_replace('/[^0-9]/', '', $phone) : null;

        $requests = collect();
        $bookings = collect();

        if ($cleanPhone) {
            $phoneSuffix = strlen($cleanPhone) >= 9 ? substr($cleanPhone, -9) : $cleanPhone;

            $requests = BookingRequest::where('tenant_id', $tenant->id)
                ->where(function ($q) use ($cleanPhone, $phoneSuffix) {
                    $q->where('from_phone', 'LIKE', "%{$phoneSuffix}%")
                        ->orWhere('from_phone', $cleanPhone);
                })
                ->with(['suggestedVehicle', 'suggestedDriver', 'booking.vehicle', 'booking.driver'])
                ->latest()
                ->get();

            $bookings = Booking::where('tenant_id', $tenant->id)
                ->whereHas('client', function ($q) use ($cleanPhone, $phoneSuffix) {
                    $q->where('phone', 'LIKE', "%{$phoneSuffix}%")
                        ->orWhere('phone', $cleanPhone);
                })
                ->with(['vehicle', 'driver', 'client'])
                ->latest()
                ->get();
        }

        $status = 'published';
        if ($request->query('preview') === 'true' && auth()->check() && auth()->user()->tenant_id === $tenant->id) {
            $status = 'draft';
        }
        $settings = $tenant->settings($status);

        return Inertia::render('Pwa/MyBookings', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
            ],
            'phone' => $phone,
            'customerPhone' => $phone,
            'requests' => $requests,
            'bookings' => $bookings,
            'settings' => $settings,
            'previewMode' => $status === 'draft',
        ]);
    }
}
