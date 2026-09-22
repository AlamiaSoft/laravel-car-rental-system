<?php

namespace App\Listeners;

use Kstmostofa\LaravelWhatsApp\Events\MessageReceived;

class ProcessWhatsAppMessage
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(MessageReceived $event): void
    {
        //
    }
}
