<?php

namespace Modules\Bot\Services\Handlers;

use Modules\Bot\Models\BotSession;

class CheckoutHandler implements BotHandlerInterface
{
    public function handle(BotSession $session, string $message, string $type): array
    {
        $session->update(['current_state' => 'CHECKOUT_TYPE']);

        return [
            'type' => 'interactive',
            'interactive' => [
                'type' => 'button',
                'body' => [
                    'text' => 'Great! How would you like your order?',
                ],
                'action' => [
                    'buttons' => [
                        [
                            'type' => 'reply',
                            'reply' => [
                                'id' => 'order_type_delivery',
                                'title' => 'Delivery',
                            ],
                        ],
                        [
                            'type' => 'reply',
                            'reply' => [
                                'id' => 'order_type_takeaway',
                                'title' => 'Takeaway',
                            ],
                        ],
                        [
                            'type' => 'reply',
                            'reply' => [
                                'id' => 'order_type_dinein',
                                'title' => 'Book a Table',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
