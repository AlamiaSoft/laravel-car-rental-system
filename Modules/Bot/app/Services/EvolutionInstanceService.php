<?php

namespace Modules\Bot\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Modules\Bot\Models\WhatsAppConnection;

class EvolutionInstanceService
{
    protected string $apiUrl;

    protected string $apiKey;

    public function __construct()
    {
        $this->apiUrl = rtrim(config('services.evolution.api_url'), '/');
        $this->apiKey = config('services.evolution.api_key') ?? '';
    }

    /**
     * Create a new Evolution instance for a tenant.
     */
    public function createInstance(Tenant $tenant): WhatsAppConnection
    {
        // Define a unique instance name
        $instanceName = 'tenant_'.$tenant->id.'_'.Str::random(6);
        $instanceToken = Str::random(32);

        Log::info("Evolution: Creating instance '{$instanceName}' for tenant '{$tenant->id}'");

        $response = Http::withHeaders([
            'apikey' => $this->apiKey,
        ])->post("{$this->apiUrl}/instance/create", [
            'instanceName' => $instanceName,
            'token' => $instanceToken,
            'qrcode' => true,
            'integration' => 'WHATSAPP-BAILEYS',
        ]);

        if (! $response->successful()) {
            Log::error('Evolution: Failed to create instance. Response: '.$response->body());
            throw new \Exception('Could not create WhatsApp instance via Evolution API.');
        }

        $data = $response->json();
        $evolutionInstanceId = $data['instance']['instanceId'] ?? null;
        $status = $data['instance']['status'] ?? 'disconnected';

        // Save connection details to database
        $connection = WhatsAppConnection::updateOrCreate(
            ['tenant_id' => $tenant->id, 'provider' => 'evolution'],
            [
                'instance_name' => $instanceName,
                'instance_token' => $instanceToken,
                'status' => $status,
                'evolution_instance_id' => $evolutionInstanceId,
                'qrcode' => null,
            ]
        );

        // Configure webhook for this instance
        $this->configureWebhook($instanceName);

        return $connection;
    }

    /**
     * Configure the webhook for a specific instance.
     */
    public function configureWebhook(string $instanceName): bool
    {
        $webhookUrl = config('services.evolution.webhook_url') ?: route('api.bot.evolution.webhook');
        Log::info("Evolution: Configuring webhook for instance '{$instanceName}' -> {$webhookUrl}");

        $response = Http::withHeaders([
            'apikey' => $this->apiKey,
        ])->post("{$this->apiUrl}/webhook/set/{$instanceName}", [
            'webhook' => [
                'enabled' => true,
                'url' => $webhookUrl,
                'webhookByEvents' => false,
                'events' => [
                    'QRCODE_UPDATED',
                    'CONNECTION_UPDATE',
                    'MESSAGES_UPSERT',
                ],
            ],
        ]);

        if (! $response->successful()) {
            Log::error("Evolution: Failed to configure webhook for '{$instanceName}'. Response: ".$response->body());

            return false;
        }

        return true;
    }

    /**
     * Retrieve the connection state / QR code for an instance.
     */
    public function connectInstance(string $instanceName): array
    {
        Log::info("Evolution: Fetching connection state/QR for instance '{$instanceName}'");

        $response = Http::withHeaders([
            'apikey' => $this->apiKey,
        ])->get("{$this->apiUrl}/instance/connect/{$instanceName}");

        if (! $response->successful()) {
            Log::error("Evolution: Failed to connect instance '{$instanceName}'. Response: ".$response->body());

            return ['status' => 'error', 'message' => 'Failed to connect to instance.'];
        }

        return $response->json();
    }

    /**
     * Get instance current connection state.
     */
    public function getConnectionState(string $instanceName): string
    {
        $response = Http::withHeaders([
            'apikey' => $this->apiKey,
        ])->get("{$this->apiUrl}/instance/connectionState/{$instanceName}");

        if ($response->successful()) {
            return $response->json()['instance']['state'] ?? 'disconnected';
        }

        return 'disconnected';
    }

    /**
     * Logout and disconnect the WhatsApp connection.
     */
    public function logoutInstance(string $instanceName): bool
    {
        Log::info("Evolution: Logging out instance '{$instanceName}'");

        $response = Http::withHeaders([
            'apikey' => $this->apiKey,
        ])->delete("{$this->apiUrl}/instance/logout/{$instanceName}");

        return $response->successful();
    }

    /**
     * Delete the instance completely from Evolution.
     */
    public function deleteInstance(WhatsAppConnection $connection): bool
    {
        Log::info("Evolution: Deleting instance '{$connection->instance_name}'");

        $response = Http::withHeaders([
            'apikey' => $this->apiKey,
        ])->delete("{$this->apiUrl}/instance/delete/{$connection->instance_name}");

        if ($response->successful()) {
            $connection->delete();

            return true;
        }

        return false;
    }
}
