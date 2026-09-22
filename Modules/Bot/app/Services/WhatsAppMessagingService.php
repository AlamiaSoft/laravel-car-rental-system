<?php

namespace Modules\Bot\Services;

use Modules\Bot\Services\Contracts\WhatsAppProvider;

class WhatsAppMessagingService
{
    protected WhatsAppProvider $provider;

    public function __construct(WhatsAppProvider $provider)
    {
        $this->provider = $provider;
    }

    /**
     * Send a standardized payload to a recipient.
     */
    public function sendMessage(string $to, array $payload): bool
    {
        $type = $payload['type'] ?? 'text';

        if ($type === 'text') {
            $text = $payload['text']['body'] ?? '';

            return $this->provider->sendText($to, $text);
        }

        if ($type === 'interactive') {
            $interactive = $payload['interactive'] ?? [];
            $interactiveType = $interactive['type'] ?? '';

            if ($interactiveType === 'button') {
                $body = $interactive['body']['text'] ?? '';

                // Format reply buttons from Meta to clean array: [['id' => '...', 'title' => '...']]
                $rawButtons = $interactive['action']['buttons'] ?? [];
                $buttons = [];
                foreach ($rawButtons as $btn) {
                    if (isset($btn['reply'])) {
                        $buttons[] = [
                            'id' => $btn['reply']['id'],
                            'title' => $btn['reply']['title'],
                        ];
                    }
                }

                return $this->provider->sendInteractiveButtons($to, $body, $buttons);
            }

            if ($interactiveType === 'list') {
                $body = $interactive['body']['text'] ?? '';
                $buttonText = $interactive['action']['button'] ?? 'Select';
                $rawSections = $interactive['action']['sections'] ?? [];

                // Map Meta sections to clean format
                $sections = [];
                foreach ($rawSections as $sec) {
                    $rows = [];
                    foreach ($sec['rows'] ?? [] as $row) {
                        $rows[] = [
                            'id' => $row['id'],
                            'title' => $row['title'],
                            'description' => $row['description'] ?? null,
                        ];
                    }
                    $sections[] = [
                        'title' => $sec['title'] ?? 'Options',
                        'rows' => $rows,
                    ];
                }

                return $this->provider->sendInteractiveList($to, $body, $buttonText, $sections);
            }
        }

        if ($type === 'location') {
            $location = $payload['location'] ?? [];
            $lat = (float) ($location['latitude'] ?? 0);
            $lng = (float) ($location['longitude'] ?? 0);
            $name = $location['name'] ?? 'Location';
            $address = $location['address'] ?? '';

            return $this->provider->sendLocation($to, $lat, $lng, $name, $address);
        }

        return false;
    }
}
