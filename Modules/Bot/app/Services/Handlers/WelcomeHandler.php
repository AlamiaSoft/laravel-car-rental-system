<?php

namespace Modules\Bot\Services\Handlers;

use App\Capability\PwaExperienceResolver;
use Modules\Bot\Models\BotSession;
use Modules\Bot\Services\CustomerPwaTokenService;
use Modules\Crm\Models\Customer;
use Modules\Orders\Models\Order;

class WelcomeHandler implements BotHandlerInterface
{
    public function handle(BotSession $session, string $message, string $type): array
    {
        $session->update(['current_state' => 'START']);
        $tenantId = tenant('id');

        // Retrieve customer from CRM (created at gateway entry)
        $customer = Customer::where('phone', $session->phone_number)->first();
        $customerId = $customer ? $customer->id : 0;

        $tenant = tenant();

        // Generate signed token & short URL
        $token = CustomerPwaTokenService::generateToken($customerId, $tenant->id);
        $pwaUrl = route('pwa.short.exchange', ['token' => $token]);

        // Resolve primary experience for message copy
        $resolver = app(PwaExperienceResolver::class);
        $baseUrl = $resolver->primaryExperience($tenant);
        $appName = $tenant->name ?: config('app.name', 'Ormeasy');

        $text = "Welcome to {$appName}!\n\nHow would you like to place your order today?\n\n1. 📜 Order directly in WhatsApp Chat\n2. 📱 Open PWA App:\n{$pwaUrl}\n\nReply '1' or tap below to browse our menu here in chat!";

        return [
            'type' => 'interactive',
            'interactive' => [
                'type' => 'button',
                'body' => ['text' => $text],
                'action' => [
                    'buttons' => [
                        [
                            'type' => 'reply',
                            'reply' => [
                                'id' => 'action_view_menu',
                                'title' => '📜 Order in WhatsApp',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private function handleRepeatOrder(BotSession $session): array
    {
        $lastOrder = Order::where('customer_phone', $session->phone_number)
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->first();

        if (! $lastOrder) {
            return $this->handle($session, '', 'text');
        }

        $cart = [];
        foreach ($lastOrder->items as $item) {
            if ($item->product_id) {
                $cart[] = [
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                ];
            }
        }

        $context = $session->context ?? [];
        $context['cart'] = $cart;
        $session->update([
            'context' => $context,
            'current_state' => 'VIEWING_CART',
        ]);

        return (new CartHandler)->handle($session, 'action_view_cart', 'interactive');
    }
}
