<?php

namespace Modules\Bot\Services\Handlers;

use Modules\Bot\Models\BotSession;

interface BotHandlerInterface
{
    /**
     * Handle the incoming message.
     *
     * @param  string  $message  Text content or interactive payload
     * @param  string  $type  Message type (text, interactive)
     * @return array Meta Cloud API formatted response array
     */
    public function handle(BotSession $session, string $message, string $type): array;
}
