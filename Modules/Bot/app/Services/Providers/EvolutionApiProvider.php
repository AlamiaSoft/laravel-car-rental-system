<?php

namespace Modules\Bot\Services\Providers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Modules\Bot\Models\BotSession;
use Modules\Bot\Models\WhatsAppConnection;
use Modules\Bot\Services\Contracts\WhatsAppProvider;

class EvolutionApiProvider implements WhatsAppProvider
{
    protected WhatsAppConnection $connection;

    protected string $apiUrl;

    protected string $apiKey;

    public function __construct(WhatsAppConnection $connection)
    {
        $this->connection = $connection;
        $this->apiUrl = rtrim(config('services.evolution.api_url'), '/');
        $this->apiKey = config('services.evolution.api_key') ?? '';
    }

    public function sendText(string $to, string $text): bool
    {
        Log::info("Evolution [{$this->connection->instance_name}]: Sending text to {$to}");

        $response = Http::withHeaders([
            'apikey' => $this->apiKey,
        ])->post("{$this->apiUrl}/message/sendText/{$this->connection->instance_name}", [
            'number' => $this->formatNumber($to),
            'text' => $text,
        ]);

        return $response->successful();
    }

    public function sendInteractiveButtons(string $to, string $body, array $buttons): bool
    {
        Log::info("Evolution [{$this->connection->instance_name}]: Sending interactive buttons to {$to}");

        $text = "{$body}\n\n";
        $optionsMap = [];
        $index = 1;

        foreach ($buttons as $btn) {
            $text .= "{$index}️⃣ *".$btn['title']."*\n";
            $optionsMap[(string) $index] = $btn['id'];
            $index++;
        }

        $text .= "\n_Reply with a number (e.g. 1) to choose._";

        // Save options map to session context
        $cleanNumber = $this->formatNumber($to);
        $session = BotSession::where('phone_number', $cleanNumber)
            ->where('tenant_id', $this->connection->tenant_id)
            ->first();
        if ($session) {
            $context = $session->context ?? [];
            $context['options_map'] = $optionsMap;
            $session->update(['context' => $context]);
        }

        return $this->sendText($to, trim($text));
    }

    public function sendInteractiveList(string $to, string $body, string $buttonText, array $sections): bool
    {
        Log::info("Evolution [{$this->connection->instance_name}]: Sending interactive list to {$to}");

        $text = "*{$body}*\n\n";
        $optionsMap = [];
        $index = 1;

        foreach ($sections as $sec) {
            if (! empty($sec['title'])) {
                $text .= '📋 *'.$sec['title']."*\n";
            }
            foreach ($sec['rows'] ?? [] as $row) {
                $text .= "{$index}️⃣ *".$row['title'].'*';
                if (! empty($row['description'])) {
                    $text .= ' - '.$row['description'];
                }
                $text .= "\n";
                $optionsMap[(string) $index] = $row['id'];
                $index++;
            }
            $text .= "\n";
        }

        $text .= '_Reply with a number (e.g. 1) to choose._';

        // Save options map to session context
        $cleanNumber = $this->formatNumber($to);
        $session = BotSession::where('phone_number', $cleanNumber)
            ->where('tenant_id', $this->connection->tenant_id)
            ->first();
        if ($session) {
            $context = $session->context ?? [];
            $context['options_map'] = $optionsMap;
            $session->update(['context' => $context]);
        }

        return $this->sendText($to, trim($text));
    }

    public function sendLocation(string $to, float $lat, float $lng, string $name, string $address): bool
    {
        Log::info("Evolution [{$this->connection->instance_name}]: Sending location to {$to}");

        $response = Http::withHeaders([
            'apikey' => $this->apiKey,
        ])->post("{$this->apiUrl}/message/sendLocation/{$this->connection->instance_name}", [
            'number' => $this->formatNumber($to),
            'latitude' => $lat,
            'longitude' => $lng,
            'name' => $name,
            'address' => $address,
        ]);

        return $response->successful();
    }

    /**
     * Clean phone numbers: remove '+', spaces.
     */
    protected function formatNumber(string $number): string
    {
        return preg_replace('/[^0-9]/', '', $number);
    }
}
