<?php

namespace Modules\Bot\Services\Handlers;

use App\Events\OrderCreated;
use Illuminate\Support\Facades\Log;
use Modules\Bot\Models\BotSession;
use Modules\Crm\Models\Customer;
use Modules\Menu\Models\Product;
use Modules\Orders\Models\Order;

class ConfirmationHandler implements BotHandlerInterface
{
    public function handle(BotSession $session, string $message, string $type): array
    {
        $context = $session->context ?? [];
        $cart = $context['cart'] ?? [];

        if (empty($cart)) {
            return (new WelcomeHandler)->handle($session, $message, $type);
        }

        if ($type === 'system' && $message === 'ready_to_confirm') {
            $session->update(['current_state' => 'CONFIRMATION']);

            $cartText = "*Confirm Your Order:*\n\n";
            $total = 0;
            foreach ($cart as $item) {
                $product = Product::find($item['product_id']);
                if ($product) {
                    $lineTotal = $product->price * $item['quantity'];
                    $total += $lineTotal;
                    $cartText .= "{$item['quantity']}x {$product->name} - Rs {$lineTotal}\n";
                }
            }
            $cartText .= "\n*Total: Rs {$total}*\nOrder Type: {$context['order_type']}";
            if (isset($context['address'])) {
                $cartText .= "\nAddress: {$context['address']}";
            }
            if (isset($context['table_number'])) {
                $cartText .= "\nTable: {$context['table_number']}";
            }

            return [
                'type' => 'interactive',
                'interactive' => [
                    'type' => 'button',
                    'body' => ['text' => $cartText],
                    'action' => [
                        'buttons' => [
                            ['type' => 'reply', 'reply' => ['id' => 'action_confirm_order', 'title' => 'Confirm Order']],
                            ['type' => 'reply', 'reply' => ['id' => 'action_cancel_order', 'title' => 'Cancel Order']],
                        ],
                    ],
                ],
            ];
        }

        if ($type === 'interactive') {
            if ($message === 'action_cancel_order') {
                $session->delete();

                return [
                    'type' => 'text',
                    'text' => ['body' => 'Order cancelled. Type "Hi" to start again.'],
                ];
            }

            if ($message === 'action_confirm_order') {
                // Calculate Total
                $total = 0;
                foreach ($cart as $item) {
                    $product = Product::find($item['product_id']);
                    if ($product) {
                        $total += $product->price * $item['quantity'];
                    }
                }

                // Make order
                $order = Order::create([
                    'order_number' => 'ORD-'.strtoupper(uniqid()),
                    'customer_phone' => $session->phone_number,
                    'customer_name' => 'WhatsApp Customer',
                    'total_amount' => $total,
                    'status' => 'Pending',
                    'order_type' => 'WhatsApp',
                    'type' => strtolower($context['order_type'] ?? 'delivery'),
                    'source' => 'whatsapp',
                    'delivery_address' => $context['address'] ?? null,
                    'table_number' => $context['table_number'] ?? null,
                ]);

                foreach ($cart as $item) {
                    $product = Product::find($item['product_id']);
                    if ($product) {
                        $order->items()->create([
                            'product_id' => $product->id,
                            'quantity' => $item['quantity'],
                            'unit_price' => $product->price,
                            'subtotal' => $product->price * $item['quantity'],
                        ]);
                    }
                }

                // Update CRM
                $customer = Customer::firstOrCreate(
                    ['phone' => $session->phone_number]
                );
                $customer->name = $customer->name ?? 'WhatsApp Customer';
                $customer->total_orders += 1;
                $customer->total_spent += $total;
                $customer->last_order_date = now();
                $customer->save();

                // Save Customer Address if Delivery
                if (strtolower($context['order_type'] ?? '') === 'delivery' && ! empty($context['address'])) {
                    $addressExists = $customer->addresses()->where('address', $context['address'])->exists();
                    if (! $addressExists) {
                        $customer->addresses()->create([
                            'address' => $context['address'],
                            'latitude' => $context['latitude'] ?? null,
                            'longitude' => $context['longitude'] ?? null,
                            'label' => 'Recent Address',
                            'last_used_at' => now(),
                        ]);
                    }
                }

                // Broadcast Event
                try {
                    broadcast(new OrderCreated($order->load('items.product'), tenant('id')));
                } catch (\Exception $e) {
                    Log::warning('Could not broadcast OrderCreated event. Reverb might be down: '.$e->getMessage());
                }

                // Clear session
                $session->delete();

                return [
                    'type' => 'text',
                    'text' => ['body' => "✅ Order Confirmed! Your order number is {$order->order_number}.\n\nWe will notify you when it's ready."],
                ];
            }
        }

        return [
            'type' => 'text',
            'text' => ['body' => 'Please confirm your order using the buttons.'],
        ];
    }
}
