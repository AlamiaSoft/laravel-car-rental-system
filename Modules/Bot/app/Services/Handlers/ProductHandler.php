<?php

namespace Modules\Bot\Services\Handlers;

use Modules\Bot\Models\BotSession;
use Modules\Menu\Models\Product;

class ProductHandler implements BotHandlerInterface
{
    public function handle(BotSession $session, string $message, string $type): array
    {
        if (str_starts_with($message, 'product_')) {
            $productId = str_replace('product_', '', $message);
            $product = Product::find($productId);

            if ($product) {
                // Instantly add to cart
                $context = $session->context ?? [];
                $cart = $context['cart'] ?? [];

                $found = false;
                foreach ($cart as &$item) {
                    if ($item['product_id'] === $product->id) {
                        $item['quantity'] += 1;
                        $found = true;
                        break;
                    }
                }

                if (! $found) {
                    $cart[] = [
                        'product_id' => $product->id,
                        'quantity' => 1,
                    ];
                }

                $context['cart'] = $cart;
                $session->update([
                    'context' => $context,
                    'current_state' => 'VIEWING_CART',
                ]);

                return (new CartHandler)->handle($session, 'action_view_cart', 'interactive');
            }
        }

        return (new UnknownResponseHandler)->handle($session, $message, $type);
    }
}
