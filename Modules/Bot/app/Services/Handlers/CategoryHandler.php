<?php

namespace Modules\Bot\Services\Handlers;

use Modules\Bot\Models\BotSession;
use Modules\Menu\Models\Product;

class CategoryHandler implements BotHandlerInterface
{
    public function handle(BotSession $session, string $message, string $type): array
    {
        // Expecting a payload like 'category_1'
        if (! str_starts_with($message, 'category_')) {
            return (new UnknownResponseHandler)->handle($session, $message, $type);
        }

        $categoryId = str_replace('category_', '', $message);

        $products = Product::where('category_id', $categoryId)
            ->where('is_active', true)
            ->get();

        if ($products->isEmpty()) {
            return (new UnknownResponseHandler)->handle($session, $message, $type);
        }

        $session->update([
            'current_state' => 'PRODUCT_SELECT',
            'context' => array_merge($session->context ?? [], ['active_category_id' => $categoryId]),
        ]);

        $rows = [];
        foreach ($products as $product) {
            $rows[] = [
                'id' => 'product_'.$product->id,
                'title' => substr($product->name, 0, 24),
                'description' => substr("Rs {$product->price} - ".$product->description, 0, 72),
            ];
        }

        return [
            'type' => 'interactive',
            'interactive' => [
                'type' => 'list',
                'body' => [
                    'text' => "Items in category:\nPlease select an item to add to your order:",
                ],
                'action' => [
                    'button' => 'View Items',
                    'sections' => [
                        [
                            'title' => 'Products',
                            'rows' => $rows,
                        ],
                    ],
                ],
            ],
        ];
    }
}
