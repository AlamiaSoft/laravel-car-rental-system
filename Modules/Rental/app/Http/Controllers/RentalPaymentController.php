<?php

namespace Modules\Rental\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Modules\Rental\Models\RentalPayment;

class RentalPaymentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:rental_bookings,id',
            'amount' => 'required|numeric|min:1',
            'method' => 'required|string|in:cash,jazzcash,easypaisa,bank_transfer',
            'status' => 'nullable|string|in:pending,paid,refunded,failed',
            'transaction_ref' => 'nullable|string|max:100',
        ]);

        $status = $validated['status'] ?? ($validated['method'] === 'cash' ? 'paid' : 'pending');

        RentalPayment::create([
            'booking_id' => $validated['booking_id'],
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'status' => $status,
            'transaction_ref' => $validated['transaction_ref'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }

    public function update(Request $request, RentalPayment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,paid,refunded,failed',
            'transaction_ref' => 'nullable|string|max:100',
        ]);

        $payment->update($validated);

        return redirect()->back()->with('success', 'Payment status updated.');
    }
}
