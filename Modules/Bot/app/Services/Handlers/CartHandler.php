<?php

namespace Modules\Bot\Services\Handlers;

use Modules\Bot\Models\BotSession;
use Modules\Menu\Models\Product;

class CartHandler implements BotHandlerInterface
{
    public function handle(BotSession $session, string $message, string $type): array
    {
        if ($message === 'action_clear_cart') {
            $context = $session->context ?? [];
            $context['cart'] = [];
            $session->update([
                'context' => $context,
                'current_state' => 'VIEWING_CART',
            ]);
        } elseif (str_starts_with($message, 'action_remove_item_')) {
            $idx = (int) str_replace('action_remove_item_', '', $message);
            $context = $session->context ?? [];
            if (isset($context['cart'][$idx])) {
                unset($context['cart'][$idx]);
                $context['cart'] = array_values($context['cart']);
                $session->update(['context' => $context]);
            }
        } elseif ($message === 'action_remove_item') {
            // Show list of items to remove
            $cart = $session->context['cart'] ?? [];
            if (empty($cart)) {
                return $this->emptyCartResponse();
            }

            $rows = [];
            foreach ($cart as $index => $item) {
                $product = Product::find($item['product_id']);
                if ($product) {
                    $rows[] = [
                        'id' => "action_remove_item_{$index}",
                        'title' => substr("Remove {$product->name}", 0, 24),
                        'description' => "Qty: {$item['quantity']}",
                    ];
                }
            }

            return [
                'type' => 'interactive',
                'interactive' => [
                    'type' => 'list',
                    'header' => ['type' => 'text', 'text' => 'Remove Item'],
                    'body' => ['text' => 'Select an item to remove from your cart:'],
                    'action' => [
                        'button' => 'Select Item',
                        'sections' => [
                            [
                                'title' => 'Cart Items',
                                'rows' => $rows,
                            ],
                        ],
                    ],
                ],
            ];
        }

        // Display Cart
        $cart = $session->context['cart'] ?? [];

        if (empty($cart)) {
            return $this->emptyCartResponse();
        }

        $cartText = "*🛒 Your Cart:*\n\n";
        $total = 0;
        $totalItems = 0;

        foreach ($cart as $item) {
            $product = Product::find($item['product_id']);
            if ($product) {
                $lineTotal = $product->price * $item['quantity'];
                $total += $lineTotal;
                $totalItems += $item['quantity'];
                $cartText .= "{$item['quantity']}x {$product->name} - Rs {$lineTotal}\n";
            }
        }

        $cartText .= "\n*Total: Rs {$total}* ({$totalItems} items)";

        return [
            'type' => 'interactive',
            'interactive' => [
                'type' => 'button',
                'body' => [
                    'text' => $cartText,
                ],
                'action' => [
                    'buttons' => [
                        [
                            'type' => 'reply',
                            'reply' => [
                                'id' => 'action_view_menu',
                                'title' => '➕ Add More',
                            ],
                        ],
                        [
                            'type' => 'reply',
                            'reply' => [
                                'id' => 'action_remove_item',
                                'title' => '➖ Remove Item',
                            ],
                        ],
                        [
                            'type' => 'reply',
                            'reply' => [
                                'id' => 'action_checkout',
                                'title' => '💳 Checkout',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private function emptyCartResponse(): array
    {
        return [
            'type' => 'interactive',
            'interactive' => [
                'type' => 'button',
                'body' => ['text' => 'Your cart is empty.'],
                'action' => [
                    'buttons' => [
                        ['type' => 'reply', 'reply' => ['id' => 'action_view_menu', 'title' => 'View Menu']],
                    ],
                ],
            ],
        ];
    }
}
