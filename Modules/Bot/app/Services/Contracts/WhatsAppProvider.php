<?php

namespace Modules\Bot\Services\Contracts;

interface WhatsAppProvider
{
    /**
     * Send a simple text message.
     */
    public function sendText(string $to, string $text): bool;

    /**
     * Send interactive buttons (maximum 3 buttons).
     */
    public function sendInteractiveButtons(string $to, string $body, array $buttons): bool;

    /**
     * Send an interactive list menu.
     */
    public function sendInteractiveList(string $to, string $body, string $buttonText, array $sections): bool;

    /**
     * Send location message.
     */
    public function sendLocation(string $to, float $lat, float $lng, string $name, string $address): bool;
}
