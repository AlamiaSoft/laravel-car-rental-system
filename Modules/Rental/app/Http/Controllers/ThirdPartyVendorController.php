<?php

namespace Modules\Rental\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Rental\Models\ThirdPartyVendor;

class ThirdPartyVendorController extends Controller
{
    public function index(): Response
    {
        $vendors = ThirdPartyVendor::withCount('bookings')
            ->latest()
            ->get();

        return Inertia::render('Rental/Vendors/Index', [
            'vendors' => $vendors,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_name' => 'required|string|max:100',
            'contact' => 'nullable|string|max:100',
        ]);

        ThirdPartyVendor::create($validated);

        return redirect()->back()->with('success', 'Third-party vendor registered successfully.');
    }

    public function update(Request $request, ThirdPartyVendor $thirdPartyVendor): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_name' => 'required|string|max:100',
            'contact' => 'nullable|string|max:100',
        ]);

        $thirdPartyVendor->update($validated);

        return redirect()->back()->with('success', 'Vendor details updated.');
    }

    public function destroy(ThirdPartyVendor $thirdPartyVendor): RedirectResponse
    {
        if ($thirdPartyVendor->bookings()->whereIn('status', ['pending', 'active'])->exists()) {
            return redirect()->back()->with('error', 'Cannot delete vendor with active or pending bookings.');
        }

        $thirdPartyVendor->delete();

        return redirect()->back()->with('success', 'Vendor removed.');
    }
}
