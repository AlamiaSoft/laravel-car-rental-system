<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\Bot\Models\WhatsAppConnection;
use Modules\Bot\Services\EvolutionInstanceService;

class SettingsController extends Controller
{
    public function integrations()
    {
        // Get the current tenant via tenancy helper
        $tenant = tenant();

        $connection = WhatsAppConnection::where('tenant_id', $tenant->id)
            ->where('provider', 'evolution')
            ->first();

        return Inertia::render('Settings/Integrations', [
            'whatsapp' => [
                'access_token' => $tenant->wa_access_token ?? '',
                'phone_number_id' => $tenant->wa_phone_number_id ?? '',
                'verify_token' => $tenant->wa_verify_token ?? '',
                'app_secret' => $tenant->wa_app_secret ?? '',
            ],
            'evolution' => $connection ? [
                'instance_name' => $connection->instance_name,
                'status' => $connection->status,
                'phone_number' => $connection->phone_number,
                'qrcode' => $connection->qrcode,
                'connected_at' => $connection->connected_at ? $connection->connected_at->toDateTimeString() : null,
            ] : null,
        ]);
    }

    public function updateIntegrations(Request $request)
    {
        $validated = $request->validate([
            'access_token' => 'nullable|string',
            'phone_number_id' => 'nullable|string',
            'verify_token' => 'nullable|string',
            'app_secret' => 'nullable|string',
        ]);

        $tenant = tenant();
        $tenant->update([
            'wa_access_token' => $validated['access_token'],
            'wa_phone_number_id' => $validated['phone_number_id'],
            'wa_verify_token' => $validated['verify_token'],
            'wa_app_secret' => $validated['app_secret'],
        ]);

        return redirect()->route('settings.integrations')->with('success', 'Integration settings updated successfully.');
    }

    public function connectEvolution(Request $request, EvolutionInstanceService $service)
    {
        $tenant = tenant();

        try {
            $connection = WhatsAppConnection::where('tenant_id', $tenant->id)
                ->where('provider', 'evolution')
                ->first();

            if (! $connection) {
                $connection = $service->createInstance($tenant);
            }

            $result = $service->connectInstance($connection->instance_name);

            $qrcode = $result['base64'] ?? $result['code'] ?? null;

            if (! $qrcode && $connection->status !== 'open') {
                // Instance might have been deleted from Evolution. Recreate it!
                \Log::info("Evolution: Instance '{$connection->instance_name}' not found on Evolution. Recreating.");
                try {
                    $service->deleteInstance($connection);
                } catch (\Exception $e) {
                    // Ignore delete failure
                }

                // Re-create and re-configure webhook
                $connection = $service->createInstance($tenant);

                // Try connecting again
                $result = $service->connectInstance($connection->instance_name);
                $qrcode = $result['base64'] ?? $result['code'] ?? null;
            }

            if ($qrcode) {
                $connection->update([
                    'qrcode' => $qrcode,
                    'status' => 'connecting',
                ]);
            }

            return response()->json([
                'success' => true,
                'status' => $connection->status,
                'qrcode' => $connection->qrcode,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function checkEvolutionState(Request $request, EvolutionInstanceService $service)
    {
        $tenant = tenant();
        $connection = WhatsAppConnection::where('tenant_id', $tenant->id)
            ->where('provider', 'evolution')
            ->first();

        if (! $connection) {
            return response()->json(['status' => 'not_created']);
        }

        $liveState = $service->getConnectionState($connection->instance_name);

        if ($liveState !== $connection->status) {
            $connection->update([
                'status' => $liveState === 'open' ? 'open' : ($liveState === 'connecting' ? 'connecting' : 'disconnected'),
                'qrcode' => $liveState === 'open' ? null : $connection->qrcode,
                'connected_at' => $liveState === 'open' ? now() : $connection->connected_at,
            ]);
        }

        // Fallback: If not fully open/connected, poll fresh QR from Evolution to bypass webhook delay
        if ($connection->status !== 'open') {
            $result = $service->connectInstance($connection->instance_name);
            $qrcode = $result['base64'] ?? $result['code'] ?? null;
            if ($qrcode && $qrcode !== $connection->qrcode) {
                $connection->update([
                    'qrcode' => $qrcode,
                    'status' => 'connecting',
                ]);
            }
        }

        return response()->json([
            'status' => $connection->status,
            'qrcode' => $connection->qrcode,
            'phone_number' => $connection->phone_number,
        ]);
    }

    public function disconnectEvolution(Request $request, EvolutionInstanceService $service)
    {
        $tenant = tenant();
        $connection = WhatsAppConnection::where('tenant_id', $tenant->id)
            ->where('provider', 'evolution')
            ->first();

        if ($connection) {
            try {
                $service->logoutInstance($connection->instance_name);
            } catch (\Exception $e) {
                // Ignore logout errors if instance is already dead
            }
            $service->deleteInstance($connection);
        }

        return redirect()->route('settings.integrations')->with('success', 'WhatsApp connection deleted successfully.');
    }

    public function updateBusinessProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $tenant = tenant();
        $tenant->update(['name' => $validated['name']]);

        return redirect()->back()->with('success', 'Business profile updated successfully.');
    }
}
