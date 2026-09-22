<?php

namespace Modules\Bot\Services\Handlers;

use Modules\Bot\Models\BotSession;

class UnknownResponseHandler implements BotHandlerInterface
{
    public function handle(BotSession $session, string $message, string $type): array
    {
        $state = $session->current_state;

        $response = match ($state) {
            'CATEGORY_SELECT' => (new MenuHandler)->handle($session, $message, $type),
            'PRODUCT_SELECT' => $this->handleProductSelectFallback($session, $message, $type),
            'VIEWING_CART' => (new CartHandler)->handle($session, 'action_view_cart', 'interactive'),
            default => (new WelcomeHandler)->handle($session, $message, $type),
        };

        $cleanMsg = trim($message);

        if ($response['type'] === 'interactive' && isset($response['interactive']['body']['text'])) {
            $response['interactive']['body']['text'] = "Sorry, \"{$cleanMsg}\" is not a valid choice.\n\n".$response['interactive']['body']['text'];
        } elseif ($response['type'] === 'text' && isset($response['text']['body'])) {
            $response['text']['body'] = "Sorry, \"{$cleanMsg}\" is not a valid choice.\n\n".$response['text']['body'];
        }

        return $response;
    }

    private function handleProductSelectFallback(BotSession $session, string $message, string $type): array
    {
        $context = $session->context ?? [];
        $activeCategoryId = $context['active_category_id'] ?? null;

        if ($activeCategoryId) {
            return (new CategoryHandler)->handle($session, "category_{$activeCategoryId}", 'interactive');
        }

        return (new MenuHandler)->handle($session, $message, $type);
    }
}
