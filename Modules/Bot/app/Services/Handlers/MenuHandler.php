<?php

namespace Modules\Bot\Services\Handlers;

use Modules\Bot\Models\BotSession;
use Modules\Menu\Models\Category;

class MenuHandler implements BotHandlerInterface
{
    public function handle(BotSession $session, string $message, string $type): array
    {
        $session->update(['current_state' => 'CATEGORY_SELECT']);

        $categories = Category::where('is_active', true)->get();

        $rows = [];
        foreach ($categories as $category) {
            $rows[] = [
                'id' => 'category_'.$category->id,
                'title' => substr($category->name, 0, 24), // Max 24 chars for Meta API list items
                'description' => substr($category->description ?? 'View items', 0, 72), // Max 72 chars
            ];
        }

        // If no categories, fallback
        if (empty($rows)) {
            return [
                'type' => 'text',
                'text' => [
                    'body' => 'Sorry, our menu is currently empty!',
                ],
            ];
        }

        return [
            'type' => 'interactive',
            'interactive' => [
                'type' => 'list',
                'header' => [
                    'type' => 'text',
                    'text' => 'Our Menu',
                ],
                'body' => [
                    'text' => 'Please choose a category from the list below:',
                ],
                'action' => [
                    'button' => 'Categories',
                    'sections' => [
                        [
                            'title' => 'Menu Categories',
                            'rows' => $rows,
                        ],
                    ],
                ],
            ],
        ];
    }
}
