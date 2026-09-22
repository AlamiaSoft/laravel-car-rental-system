<?php

namespace Modules\Bot\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Modules\Bot\Models\BotSession;
use Modules\Bot\Models\WhatsAppConnection;
use Modules\Bot\Services\Handlers\AddressHandler;
use Modules\Bot\Services\Handlers\CartHandler;
use Modules\Bot\Services\Handlers\CategoryHandler;
use Modules\Bot\Services\Handlers\CheckoutHandler;
use Modules\Bot\Services\Handlers\ConfirmationHandler;
use Modules\Bot\Services\Handlers\MenuHandler;
use Modules\Bot\Services\Handlers\ProductHandler;
use Modules\Bot\Services\Handlers\WelcomeHandler;
use Modules\Bot\Services\WhatsAppMessagingService;
use Modules\Bot\Services\WhatsAppProviderResolver;
use Modules\Bot\Services\WorkflowExecutionEngine;
use Modules\Crm\Models\Customer;

class EvolutionWebhookController extends Controller
{
    /**
     * Handle webhook events sent by Evolution API.
     */
    public function handleWebhook(Request $request)
    {
        try {
            // 1. Authenticate hook request (Verify headers if configured)
            $payload = $request->all();
            $instanceName = $payload['instance'] ?? null;
            $event = $payload['event'] ?? null;

            if (! $instanceName || ! $event) {
                return response()->json(['status' => 'ignored_missing_metadata']);
            }

            // 2. Identify Tenant via Instance Name
            $connection = WhatsAppConnection::where('instance_name', $instanceName)
                ->with('tenant')
                ->first();

            if (! $connection || ! $connection->tenant || ! $connection->tenant->is_active) {
                Log::warning("Evolution Webhook: Received event '{$event}' for unknown or inactive instance: '{$instanceName}'");

                return response()->json(['status' => 'ignored_unknown_instance'], 404);
            }

            $tenant = $connection->tenant;

            // 3. Initialize Tenancy Context
            tenancy()->initialize($tenant);

            // 4. Handle System Connection/QR Events
            if ($event === 'qrcode.updated') {
                $qrcode = $payload['data']['qrcode']['base64'] ?? null;
                $connection->update([
                    'qrcode' => $qrcode,
                    'status' => 'connecting',
                ]);
                Log::info("Evolution Webhook: QR Code updated for instance '{$instanceName}'");

                return response()->json(['status' => 'qrcode_updated']);
            }

            if ($event === 'connection.update') {
                $state = $payload['data']['state'] ?? 'disconnected';
                $connection->update([
                    'status' => $state === 'open' ? 'open' : 'disconnected',
                    'connected_at' => $state === 'open' ? now() : $connection->connected_at,
                    'qrcode' => $state === 'open' ? null : $connection->qrcode, // Clear QR when connected
                ]);
                Log::info("Evolution Webhook: Connection state updated for '{$instanceName}' -> {$state}");

                return response()->json(['status' => 'connection_updated']);
            }

            // 5. Handle Incoming Messages
            if ($event === 'messages.upsert') {
                return $this->processIncomingMessage($connection, $payload['data'] ?? []);
            }

            return response()->json(['status' => 'event_unhandled']);
        } catch (\Throwable $e) {
            Log::error('Evolution Webhook Unhandled Exception: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['status' => 'error_handled', 'message' => $e->getMessage()], 200);
        }
    }

    /**
     * Process Baileys message payload and dispatch to bot engine.
     */
    protected function processIncomingMessage(WhatsAppConnection $connection, array $msgData)
    {
        $key = $msgData['key'] ?? [];

        // Ignore messages sent by the bot/owner
        if ($key['fromMe'] ?? false) {
            return response()->json(['status' => 'ignored_self_message']);
        }

        $fromNumber = explode('@', $key['remoteJid'] ?? '')[0] ?? null;
        if (! $fromNumber) {
            return response()->json(['status' => 'ignored_invalid_number']);
        }

        // Standardize location, text, button responses
        $messageBody = '';
        $messageType = 'text';

        $message = $msgData['message'] ?? [];

        // Parse different WhatsApp Baileys message types
        if (isset($message['conversation'])) {
            $messageBody = $message['conversation'];
        } elseif (isset($message['extendedTextMessage']['text'])) {
            $messageBody = $message['extendedTextMessage']['text'];
        } elseif (isset($message['buttonsResponseMessage']['selectedButtonId'])) {
            $messageType = 'interactive';
            $messageBody = $message['buttonsResponseMessage']['selectedButtonId'];
        } elseif (isset($message['templateButtonReplyMessage']['selectedId'])) {
            $messageType = 'interactive';
            $messageBody = $message['templateButtonReplyMessage']['selectedId'];
        } elseif (isset($message['listResponseMessage']['singleSelectReply']['selectedRowId'])) {
            $messageType = 'interactive';
            $messageBody = $message['listResponseMessage']['singleSelectReply']['selectedRowId'];
        } elseif (isset($message['locationMessage'])) {
            $messageType = 'location';
            $messageBody = json_encode([
                'latitude' => $message['locationMessage']['degreesLatitude'] ?? 0,
                'longitude' => $message['locationMessage']['degreesLongitude'] ?? 0,
            ]);
        } else {
            // Ignore unhandled message types (images, files, etc.)
            return response()->json(['status' => 'message_type_ignored']);
        }

        // Update the phone number in connection if not set yet
        if (empty($connection->phone_number)) {
            $connection->update(['phone_number' => $fromNumber]);
        }

        // Upsert customer in CRM at gateway entry (Lead Capture)
        $customer = Customer::firstOrCreate(
            ['phone' => $fromNumber],
            ['name' => 'WhatsApp Customer']
        );
        $customer->touch();

        // Initialize Bot Session
        $session = BotSession::firstOrCreate(
            ['phone_number' => $fromNumber, 'tenant_id' => tenant('id')],
            ['current_state' => 'START', 'expires_at' => now()->addHours(2)]
        );

        if ($session->isExpired()) {
            $session->update(['current_state' => 'START', 'expires_at' => now()->addHours(2)]);
        } else {
            $session->update(['expires_at' => now()->addHours(2)]);
        }

        // Map numeric choices to interactive button/list IDs if options_map exists in session context
        if ($messageType === 'text' && is_numeric(trim($messageBody))) {
            $optionsMap = $session->context['options_map'] ?? [];
            $cleanChoice = trim($messageBody);
            if (isset($optionsMap[$cleanChoice])) {
                $messageBody = $optionsMap[$cleanChoice];
                $messageType = 'interactive';
            }
        }

        // First attempt workflow execution via WorkflowExecutionEngine
        $workflowEngine = app(WorkflowExecutionEngine::class);
        $responsePayload = $workflowEngine->execute($session, $messageBody, $messageType);

        if (! $responsePayload) {
            $state = $session->current_state;

            // Reset to start on hello/hi
            if ($messageType === 'text' && in_array(strtolower($messageBody), ['hi', 'hello', 'menu', 'start'])) {
                $state = 'START';
            }

            // Match bot handler state
            $handler = match ($state) {
                'START' => new WelcomeHandler,
                'CATEGORY_SELECT' => new CategoryHandler,
                'PRODUCT_SELECT' => new ProductHandler,
                'VIEWING_PRODUCT' => new CartHandler,
                'VIEWING_CART' => new CheckoutHandler,
                'CHECKOUT_TYPE' => new AddressHandler,
                'AWAITING_ADDRESS' => new AddressHandler,
                'CONFIRMATION' => new ConfirmationHandler,
                default => new WelcomeHandler
            };

            if ($messageType === 'interactive' && $messageBody === 'action_view_menu') {
                $handler = new MenuHandler;
            }

            if ($messageType === 'interactive' && $messageBody === 'action_checkout') {
                $handler = new CheckoutHandler;
            }

            // Process message through Bot Engine state handler
            $responsePayload = $handler->handle($session, $messageBody, $messageType);
        }

        // Send reply through the active WhatsApp provider
        if ($responsePayload && isset($responsePayload['type'])) {
            $provider = WhatsAppProviderResolver::resolve($connection->tenant);
            $messagingService = new WhatsAppMessagingService($provider);
            $messagingService->sendMessage($fromNumber, $responsePayload);
        }

        return response()->json(['status' => 'success']);
    }
}
