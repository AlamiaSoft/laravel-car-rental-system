<?php

namespace Modules\Bot\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Modules\Bot\Models\BotSession;
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

class BotController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('bot::index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('bot::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) {}

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('bot::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('bot::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id) {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {}

    public function verifyWebhook(Request $request)
    {
        $verifyToken = env('WHATSAPP_VERIFY_TOKEN');
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode && $token) {
            if ($mode === 'subscribe' && $token === $verifyToken) {
                return response($challenge, 200);
            }

            return response('Forbidden', 403);
        }

        return response('Bad Request', 400);
    }

    public function handleWebhook(Request $request)
    {
        $payload = $request->all();

        $tenantIdParam = $request->route('tenant');
        $tenant = null;

        $isSimulator = false;

        if ($tenantIdParam) {
            $tenant = Tenant::find($tenantIdParam);
            $isSimulator = true;
        } else {
            // 1. Extract phone_number_id
            $phoneNumberId = null;
            if (isset($payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'])) {
                $phoneNumberId = $payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'];
            } else {
                // Check for simulator mode
                $phoneNumberId = $request->phone_number_id;
            }

            if (! $phoneNumberId) {
                return response()->json(['status' => 'ignored']);
            }

            // 2. Identify Tenant
            $tenant = Tenant::where('wa_phone_number_id', $phoneNumberId)->first();
        }

        if (! $tenant || ! $tenant->is_active) {
            \Log::warning('Webhook received for unknown or inactive phone_number_id/tenant.');

            return response()->json(['status' => 'tenant_not_found_or_inactive'], 404);
        }

        // 3. Initialize Tenancy
        tenancy()->initialize($tenant);

        $fromNumber = null;
        $messageBody = '';
        $messageType = 'text';

        // 4. Parse incoming message
        if (isset($payload['entry'][0]['changes'][0]['value']['messages'][0])) {
            $msg = $payload['entry'][0]['changes'][0]['value']['messages'][0];
            $fromNumber = $msg['from'];
            if ($msg['type'] === 'text') {
                $messageBody = $msg['text']['body'];
            } elseif ($msg['type'] === 'interactive') {
                $messageType = 'interactive';
                if ($msg['interactive']['type'] === 'button_reply') {
                    $messageBody = $msg['interactive']['button_reply']['id'];
                } elseif ($msg['interactive']['type'] === 'list_reply') {
                    $messageBody = $msg['interactive']['list_reply']['id'];
                }
            } elseif ($msg['type'] === 'location') {
                $messageType = 'location';
                $messageBody = json_encode($msg['location']);
            }
        } elseif ($request->has('simulator')) {
            $fromNumber = $request->phone ?? '+1234567890';
            $messageBody = $request->message ?? '';
            $messageType = $request->type ?? 'text';
        } else {
            // Status updates (read, delivered, sent) or other events. Just ignore for now.
            return response()->json(['status' => 'event_ignored']);
        }

        if (! $fromNumber) {
            return response()->json(['status' => 'no_sender']);
        }

        // 5. Bot Session Management
        $session = BotSession::firstOrCreate(
            ['phone_number' => $fromNumber, 'tenant_id' => tenant('id')],
            ['current_state' => 'START', 'expires_at' => now()->addHours(2)]
        );

        if ($session->isExpired()) {
            $session->update(['current_state' => 'START', 'expires_at' => now()->addHours(2)]);
        } else {
            $session->update(['expires_at' => now()->addHours(2)]);
        }

        $state = $session->current_state;

        if ($messageType === 'text' && in_array(strtolower($messageBody), ['hi', 'hello', 'menu', 'start'])) {
            $state = 'START';
        }

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

        if ($messageBody === 'action_view_menu' || (is_string($messageBody) && trim($messageBody) === '1')) {
            $handler = new MenuHandler;
        }

        if ($messageType === 'interactive' && $messageBody === 'action_checkout') {
            $handler = new CheckoutHandler;
        }

        // Handle the message
        $responsePayload = $handler->handle($session, $messageBody, $messageType);

        if ($responsePayload && isset($responsePayload['type'])) {
            $type = $responsePayload['type'];
            $payload = $responsePayload[$type];

            if ($isSimulator) {
                return response()->json($responsePayload);
            }

            $provider = WhatsAppProviderResolver::resolve($tenant);
            $messagingService = new WhatsAppMessagingService($provider);
            $messagingService->sendMessage($fromNumber, $responsePayload);
        }

        return response()->json(['status' => 'success']);
    }
}
