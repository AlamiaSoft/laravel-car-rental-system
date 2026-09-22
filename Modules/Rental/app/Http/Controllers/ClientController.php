<?php

namespace Modules\Rental\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Rental\Models\Client;

class ClientController extends Controller
{
    public function index(): Response
    {
        $clients = Client::withCount('bookings')
            ->latest()
            ->get();

        return Inertia::render('Rental/Clients/Index', [
            'clients' => $clients,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = tenant('id');

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => [
                'required',
                'string',
                'max:30',
                Rule::unique('rental_clients', 'phone')->where('tenant_id', $tenantId),
            ],
            'cnic' => 'nullable|string|max:30',
            'license_doc_url' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        Client::create($validated);

        return redirect()->back()->with('success', 'Client registered successfully.');
    }

    public function update(Request $request, Client $client): RedirectResponse
    {
        $tenantId = tenant('id');

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => [
                'required',
                'string',
                'max:30',
                Rule::unique('rental_clients', 'phone')
                    ->where('tenant_id', $tenantId)
                    ->ignore($client->id),
            ],
            'cnic' => 'nullable|string|max:30',
            'license_doc_url' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $client->update($validated);

        return redirect()->back()->with('success', 'Client information updated.');
    }

    public function destroy(Client $client): RedirectResponse
    {
        if ($client->bookings()->whereIn('status', ['pending', 'active'])->exists()) {
            return redirect()->back()->with('error', 'Cannot delete a client with active or pending bookings.');
        }

        $client->delete();

        return redirect()->back()->with('success', 'Client profile deleted.');
    }
}
