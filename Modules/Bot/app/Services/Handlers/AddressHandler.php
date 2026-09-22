<?php

namespace Modules\Bot\Services\Handlers;

use Modules\Bot\Models\BotSession;
use Modules\Crm\Models\Customer;
use Modules\Crm\Models\CustomerAddress;

class AddressHandler implements BotHandlerInterface
{
    public function handle(BotSession $session, string $message, string $type): array
    {
        $context = $session->context ?? [];

        // If we are just arriving here from CHECKOUT_TYPE
        if ($session->current_state === 'CHECKOUT_TYPE') {
            if ($type !== 'interactive' || ! str_starts_with($message, 'order_type_')) {
                return [
                    'type' => 'text',
                    'text' => ['body' => 'Please select an order type using the buttons.'],
                ];
            }

            $orderType = str_replace('order_type_', '', $message); // delivery, takeaway, dinein
            $context['order_type'] = ucfirst($orderType);

            $session->update([
                'current_state' => 'AWAITING_ADDRESS',
                'context' => $context,
            ]);

            if ($orderType === 'dinein') {
                return ['type' => 'text', 'text' => ['body' => 'Please enter your Table Number:']];
            } elseif ($orderType === 'takeaway') {
                return (new ConfirmationHandler)->handle($session, 'ready_to_confirm', 'system');
            }

            // Delivery
            $customer = Customer::where('phone', $session->phone_number)->first();
            $buttons = [];
            $text = 'Please enter your full Delivery Address or send your Location pin 📍:';

            if ($customer && $customer->addresses()->count() > 0) {
                $addresses = $customer->addresses()->orderBy('last_used_at', 'desc')->take(2)->get();
                $defaultAddress = $addresses->first();

                $text = 'Deliver to **'.($defaultAddress->label ?? 'Previous Address')."**?\n📍 ".$defaultAddress->address;

                foreach ($addresses as $address) {
                    $buttons[] = [
                        'type' => 'reply',
                        'reply' => [
                            'id' => "action_use_address_{$address->id}",
                            'title' => substr('✅ '.($address->label ?? 'Use Previous'), 0, 20),
                        ],
                    ];
                }
                $buttons[] = ['type' => 'reply', 'reply' => ['id' => 'action_new_address', 'title' => '➕ New Address']];

                return [
                    'type' => 'interactive',
                    'interactive' => [
                        'type' => 'button',
                        'body' => ['text' => $text],
                        'action' => ['buttons' => $buttons],
                    ],
                ];
            }

            return ['type' => 'text', 'text' => ['body' => $text]];
        }

        // If we are receiving the address/table text or location
        if ($session->current_state === 'AWAITING_ADDRESS') {
            if ($type === 'interactive' && str_starts_with($message, 'action_use_address_')) {
                $addressId = str_replace('action_use_address_', '', $message);
                $address = CustomerAddress::find($addressId);

                if ($address) {
                    $context['address'] = $address->address;
                    $context['latitude'] = $address->latitude;
                    $context['longitude'] = $address->longitude;
                    $address->update(['last_used_at' => now()]);
                }
            } elseif ($type === 'interactive' && $message === 'action_new_address') {
                return [
                    'type' => 'text',
                    'text' => ['body' => 'Please type your new address or send a location pin 📍:'],
                ];
            } elseif ($type === 'location') {
                $loc = json_decode($message, true);
                $context['address'] = $loc['address'] ?? ($loc['name'] ?? 'Location Pin');
                $context['latitude'] = $loc['latitude'] ?? null;
                $context['longitude'] = $loc['longitude'] ?? null;
            } elseif ($type === 'text') {
                if ($context['order_type'] === 'Dinein') {
                    $context['table_number'] = $message;
                } else {
                    $context['address'] = $message;
                }
            } else {
                return [
                    'type' => 'text',
                    'text' => ['body' => 'Please type your address, send a location, or select an option.'],
                ];
            }

            $session->update(['context' => $context]);

            return (new ConfirmationHandler)->handle($session, 'ready_to_confirm', 'system');
        }

        return (new WelcomeHandler)->handle($session, $message, $type);
    }
}
