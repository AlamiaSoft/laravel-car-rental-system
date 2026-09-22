<?php

namespace Modules\Bot\Services;

use Modules\Bot\Models\BotSession;
use Modules\Bot\Models\BotWorkflow;
use Modules\Bot\Services\Handlers\AddressHandler;
use Modules\Bot\Services\Handlers\CartHandler;
use Modules\Bot\Services\Handlers\CategoryHandler;
use Modules\Bot\Services\Handlers\CheckoutHandler;
use Modules\Bot\Services\Handlers\ConfirmationHandler;
use Modules\Bot\Services\Handlers\MenuHandler;
use Modules\Bot\Services\Handlers\ProductHandler;
use Modules\Bot\Services\Handlers\UnknownResponseHandler;
use Modules\Crm\Models\Customer;
use Modules\Menu\Models\Category;

class WorkflowExecutionEngine
{
    /**
     * Execute workflow logic for the active bot session.
     */
    public function execute(BotSession $session, string $messageBody, string $messageType): ?array
    {
        $tenant = tenant();
        if (! $tenant) {
            return null;
        }

        // 1. Resolve Active Workflow (Tenant Specific or Global Template Fallback)
        $workflow = BotWorkflow::where('tenant_id', $tenant->id)
            ->active()
            ->first();

        if (! $workflow) {
            $workflow = BotWorkflow::globalTemplates()
                ->active()
                ->first();
        }

        // If no active workflow exists, return null to fallback to legacy state machine handlers
        if (! $workflow || empty($workflow->nodes_schema)) {
            return null;
        }

        $nodes = collect($workflow->nodes_schema);
        $edges = collect($workflow->edges_schema ?? []);

        // 2. Check if incoming message is a trigger keyword (Reset session to root node)
        $cleanMessage = strtolower(trim($messageBody));
        $isTrigger = false;

        if ($workflow->trigger_keywords) {
            foreach ($workflow->trigger_keywords as $keyword) {
                if (strtolower($keyword) === $cleanMessage) {
                    $isTrigger = true;
                    break;
                }
            }
        }

        if ($isTrigger || empty($session->current_node_key)) {
            $rootNode = $nodes->firstWhere('type', 'trigger') ?? $nodes->first();
            if ($rootNode) {
                $session->update([
                    'workflow_id' => $workflow->id,
                    'current_node_key' => $rootNode['key'],
                ]);
            }
        }

        $currentNodeKey = $session->current_node_key;
        $currentNode = $nodes->firstWhere('key', $currentNodeKey);

        if (! $currentNode) {
            return (new UnknownResponseHandler)->handle($session, $messageBody, $messageType);
        }

        // 3. Process current node execution & transition
        return $this->processNode($session, $currentNode, $nodes, $edges, $messageBody, $messageType);
    }

    protected function processNode(
        BotSession $session,
        array $currentNode,
        $nodes,
        $edges,
        string $messageBody,
        string $messageType
    ): array {
        $nodeType = $currentNode['type'] ?? 'message';
        $config = $currentNode['config'] ?? [];

        switch ($nodeType) {
            case 'trigger':
            case 'message':
                return $this->renderMessageNode($session, $currentNode, $nodes, $edges);

            case 'catalog_menu':
                return $this->renderCatalogNode($session, $currentNode, $nodes, $edges, $messageBody);

            case 'pwa_link':
                return $this->renderPwaLinkNode($session, $currentNode);

            case 'system_action':
                return $this->executeSystemAction($session, $config['action'] ?? 'menu', $messageBody, $messageType);

            default:
                return (new UnknownResponseHandler)->handle($session, $messageBody, $messageType);
        }
    }

    protected function renderMessageNode(BotSession $session, array $currentNode, $nodes, $edges): array
    {
        $config = $currentNode['config'] ?? [];
        $tenant = tenant();
        $appName = $tenant->name ?: config('app.name', 'Ormeasy');

        // Interpolate placeholders
        $text = $config['body'] ?? "Welcome to {$appName}!";
        $text = str_replace(['{{tenant.name}}', '{{app_name}}'], $appName, $text);

        $buttons = $config['buttons'] ?? [];
        if (! empty($buttons)) {
            $formattedButtons = [];
            foreach ($buttons as $btn) {
                $formattedButtons[] = [
                    'type' => 'reply',
                    'reply' => [
                        'id' => $btn['id'] ?? 'btn_'.$btn['title'],
                        'title' => $btn['title'],
                    ],
                ];
            }

            return [
                'type' => 'interactive',
                'interactive' => [
                    'type' => 'button',
                    'body' => ['text' => $text],
                    'action' => [
                        'buttons' => $formattedButtons,
                    ],
                ],
            ];
        }

        return [
            'type' => 'text',
            'text' => ['body' => $text],
        ];
    }

    protected function renderCatalogNode(BotSession $session, array $currentNode, $nodes, $edges, string $messageBody): array
    {
        $categories = Category::where('is_active', true)
            ->with(['products' => function ($q) {
                $q->where('is_available', true);
            }])
            ->get();

        if ($categories->isEmpty()) {
            return [
                'type' => 'text',
                'text' => ['body' => 'Sorry, our catalog is currently empty. Please check back later!'],
            ];
        }

        $optionsMap = [];
        $menuText = "📋 *Menu Categories*\n\n";

        foreach ($categories as $index => $category) {
            $num = $index + 1;
            $optionsMap[(string) $num] = "cat_{$category->id}";
            $menuText .= "{$num}️⃣ *{$category->name}*\n";
        }

        $menuText .= "\nReply with a number (e.g. 1) to choose a category.";

        $context = $session->context ?? [];
        $context['options_map'] = $optionsMap;
        $session->update([
            'context' => $context,
            'current_state' => 'CATEGORY_SELECT',
        ]);

        return [
            'type' => 'text',
            'text' => ['body' => $menuText],
        ];
    }

    protected function renderPwaLinkNode(BotSession $session, array $currentNode): array
    {
        $customer = Customer::where('phone', $session->phone_number)->first();
        $customerId = $customer ? $customer->id : 0;
        $tenant = tenant();

        $token = CustomerPwaTokenService::generateToken($customerId, $tenant->id);
        $pwaUrl = route('pwa.short.exchange', ['token' => $token]);

        $appName = $tenant->name ?: config('app.name', 'Ormeasy');
        $text = "📱 *{$appName} Mobile App*\n\nTap the link below to open our interactive PWA ordering menu:\n\n{$pwaUrl}";

        return [
            'type' => 'text',
            'text' => ['body' => $text],
        ];
    }

    protected function executeSystemAction(BotSession $session, string $action, string $messageBody, string $messageType): array
    {
        return match ($action) {
            'menu' => (new MenuHandler)->handle($session, $messageBody, $messageType),
            'category' => (new CategoryHandler)->handle($session, $messageBody, $messageType),
            'product' => (new ProductHandler)->handle($session, $messageBody, $messageType),
            'cart' => (new CartHandler)->handle($session, $messageBody, $messageType),
            'checkout' => (new CheckoutHandler)->handle($session, $messageBody, $messageType),
            'address' => (new AddressHandler)->handle($session, $messageBody, $messageType),
            'confirmation' => (new ConfirmationHandler)->handle($session, $messageBody, $messageType),
            default => (new MenuHandler)->handle($session, $messageBody, $messageType),
        };
    }
}
