<?php

namespace Modules\Bot\Services\Providers;

use App\Models\Tenant;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Modules\Bot\Services\Contracts\WhatsAppProvider;

class MetaCloudProvider implements WhatsAppProvider
{
    protected Tenant $tenant;

    protected ?string $phoneNumberId;

    protected ?string $accessToken;

    public function __construct(Tenant $tenant)
    {
        $this->tenant = $tenant;
        $this->phoneNumberId = $tenant->wa_phone_number_id ?? env('WHATSAPP_PHONE_NUMBER_ID');
        $this->accessToken = $tenant->wa_access_token ?? env('WHATSAPP_ACCESS_TOKEN');
    }

    public function sendText(string $to, string $text): bool
    {
        return $this->sendPayload($to, 'text', ['body' => $text]);
    }

    public function sendInteractiveButtons(string $to, string $body, array $buttons): bool
    {
        $formattedButtons = [];
        foreach ($buttons as $btn) {
            $formattedButtons[] = [
                'type' => 'reply',
                'reply' => [
                    'id' => $btn['id'],
                    'title' => $btn['title'],
                ],
            ];
        }

        return $this->sendPayload($to, 'interactive', [
            'type' => 'button',
            'body' => ['text' => $body],
            'action' => ['buttons' => $formattedButtons],
        ]);
    }

    public function sendInteractiveList(string $to, string $body, string $buttonText, array $sections): bool
    {
        $formattedSections = [];
        foreach ($sections as $sec) {
            $rows = [];
            foreach ($sec['rows'] ?? [] as $row) {
                $rows[] = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'description' => $row['description'] ?? '',
                ];
            }
            $formattedSections[] = [
                'title' => $sec['title'] ?? 'Options',
                'rows' => $rows,
            ];
        }

        return $this->sendPayload($to, 'interactive', [
            'type' => 'list',
            'body' => ['text' => $body],
            'action' => [
                'button' => $buttonText,
                'sections' => $formattedSections,
            ],
        ]);
    }

    public function sendLocation(string $to, float $lat, float $lng, string $name, string $address): bool
    {
        return $this->sendPayload($to, 'location', [
            'latitude' => $lat,
            'longitude' => $lng,
            'name' => $name,
            'address' => $address,
        ]);
    }

    protected function sendPayload(string $to, string $type, array $payload): bool
    {
        if (! $this->phoneNumberId || ! $this->accessToken) {
            Log::error("Meta WhatsApp Provider: Missing credentials for tenant {$this->tenant->id}");

            return false;
        }

        Log::info("Meta [{$this->phoneNumberId}]: Sending {$type} to {$to}");

        $response = Http::withToken($this->accessToken)
            ->post("https://graph.facebook.com/v19.0/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $to,
                'type' => $type,
                $type => $payload,
            ]);

        if (! $response->successful()) {
            Log::error('Meta Cloud API send failed: '.$response->body());
        }

        return $response->successful();
    }
}
