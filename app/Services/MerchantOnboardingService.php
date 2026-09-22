<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Service;
use App\Models\Tenant;
use Modules\Bot\Models\WhatsAppConnection;
use Modules\Menu\Models\Product;
use Modules\Orders\Models\Order;

class MerchantOnboardingService
{
    public function __construct(
        protected TenantSettingsService $settingsService
    ) {}

    /**
     * Compute real-time onboarding checklist status for a tenant.
     */
    public function getOnboardingStatus(?string $tenantId = null): array
    {
        $tenantId = $tenantId ?? (tenant() ? tenant('id') : null);
        if (! $tenantId) {
            return [
                'steps' => [],
                'completed_count' => 0,
                'total_count' => 5,
                'progress_percent' => 0,
                'is_all_completed' => false,
            ];
        }

        $tenant = Tenant::find($tenantId);
        $settings = $this->settingsService->getSettings($tenantId, 'published');
        $hasCap = fn (string $cap) => $tenant && $tenant->hasCapability($cap);

        // Step 1: Branding & Business Info
        $branding = $settings->branding ?? [];
        $step1Done = ! empty($branding['business_name']) || ! empty($branding['logo']);

        // Step 2: Menu / Services Setup
        if ($hasCap('services') && ! $hasCap('catalog')) {
            $itemsCount = Service::where('is_active', true)->count();
            $step2Title = 'Add Service Offerings';
            $step2Desc = 'Configure consultation or service pricing & durations';
            $step2Route = 'services.index';
        } else {
            $itemsCount = Product::where('is_active', true)->count();
            $step2Title = 'Add or Import Menu';
            $step2Desc = 'Add food items, categories, prices, and modifiers';
            $step2Route = 'menu.categories.index';
        }
        $step2Done = $itemsCount > 0;

        // Step 3: Delivery Rules & Payments
        $ordering = $settings->ordering ?? [];
        $payments = $settings->payments ?? [];
        $step3Done = isset($ordering['delivery_fee']) || isset($payments['cod_enabled']);

        // Step 4: Connect WhatsApp
        $connection = WhatsAppConnection::where('tenant_id', $tenantId)->first();
        $step4Done = $connection && in_array($connection->status, ['open', 'connected']);

        // Step 5: Test & Launch Order / Preview
        $ordersCount = $hasCap('booking') && ! $hasCap('ordering')
            ? Booking::count()
            : Order::count();
        $step5Done = $ordersCount > 0;

        $steps = [
            [
                'id' => 'branding',
                'title' => '1. Business Profile & Branding',
                'description' => 'Set your business name, brand colors, and logo',
                'is_completed' => $step1Done,
                'route' => route('settings.miniapp'),
            ],
            [
                'id' => 'menu',
                'title' => '2. '.$step2Title,
                'description' => $step2Desc,
                'is_completed' => $step2Done,
                'route' => route($step2Route),
            ],
            [
                'id' => 'rules',
                'title' => '3. Delivery Rules & Payments',
                'description' => 'Configure delivery fees, minimum order, and payment options',
                'is_completed' => $step3Done,
                'route' => route('settings.miniapp'),
            ],
            [
                'id' => 'whatsapp',
                'title' => '4. Connect WhatsApp Channel',
                'description' => 'Link your WhatsApp number or scan QR code',
                'is_completed' => $step4Done,
                'route' => route('settings.integrations'),
            ],
            [
                'id' => 'launch',
                'title' => '5. Test & Share Your Live App',
                'description' => 'Test your WhatsApp ordering flow and share with customers',
                'is_completed' => $step5Done,
                'route' => route('pwa.app.index', ['tenant_slug' => $tenantId]),
            ],
        ];

        $completedCount = count(array_filter($steps, fn ($s) => $s['is_completed']));
        $totalCount = count($steps);
        $progressPercent = (int) round(($completedCount / $totalCount) * 100);

        return [
            'steps' => $steps,
            'completed_count' => $completedCount,
            'total_count' => $totalCount,
            'progress_percent' => $progressPercent,
            'is_all_completed' => $completedCount === $totalCount,
        ];
    }
}
