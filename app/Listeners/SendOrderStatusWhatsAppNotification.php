<?php

namespace App\Listeners;

use App\Events\OrderStatusUpdated;
use App\Models\Tenant;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Modules\Bot\Services\WhatsAppMessagingService;
use Modules\Bot\Services\WhatsAppProviderResolver;

class SendOrderStatusWhatsAppNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Number of retry attempts.
     */
    public int $tries = 3;

    /**
     * Backoff intervals in seconds between retries.
     */
    public array $backoff = [10, 30, 60];

    /**
     * Handle the event.
     */
    public function handle(OrderStatusUpdated $event): void
    {
        try {
            $order = $event->order;
            $tenantId = $event->tenantId;

            // Only send updates if the order is a WhatsApp order
            if ($order->source !== 'whatsapp' || empty($order->customer_phone)) {
                return;
            }

            // Idempotency check: prevent duplicate notifications for this order status
            $idempotencyKey = "wa_notif_{$order->id}_{$order->status}";
            if (! Cache::add($idempotencyKey, true, now()->addHours(6))) {
                Log::info("WhatsApp Notification skipped (already dispatched): {$idempotencyKey}");

                return;
            }

            // Initialize tenant context
            tenancy()->initialize($tenantId);
            $tenant = Tenant::find($tenantId);

            if (! $tenant || ! $tenant->is_active) {
                return;
            }

            // Resolve active WhatsApp provider
            $provider = WhatsAppProviderResolver::resolve($tenant);
            $messagingService = new WhatsAppMessagingService($provider);

            $settings = $tenant->settings('published');
            $templates = $settings->whatsapp ?? [];

            $statusMessages = [
                'Preparing' => $templates['order_preparing'] ?? 'Your order {order_number} is now in the kitchen.',
                'Ready' => $templates['order_ready'] ?? 'Your order {order_number} is ready!',
                'Delivered' => $templates['order_delivered'] ?? 'Your order {order_number} has been delivered!',
            ];

            if (isset($statusMessages[$order->status])) {
                $templateText = $statusMessages[$order->status];
                $messageBody = str_replace('{order_number}', $order->order_number, $templateText);
                $trackingUrl = route('pwa.track', ['tenant_slug' => $tenantId, 'order_number' => $order->order_number]);
                $body = $messageBody."\n\nTrack order live:\n".$trackingUrl;

                $messagingService->sendMessage($order->customer_phone, [
                    'type' => 'text',
                    'text' => [
                        'body' => $body,
                    ],
                ]);
            }
        } catch (\Exception $e) {
            Log::warning('WhatsApp Milestone Notification Failed: '.$e->getMessage());
            throw $e; // Rethrow to trigger queued retry if needed
        }
    }
}
