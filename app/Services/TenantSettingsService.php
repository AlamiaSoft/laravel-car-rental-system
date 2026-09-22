<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantSetting;

class TenantSettingsService
{
    /**
     * Get fallback default values for setting groups.
     */
    public static function getDefaults(): array
    {
        return [
            'branding' => [
                'business_name' => '',
                'logo' => '',
                'favicon' => '',
                'primary_color' => '#ef4444',
                'tagline' => 'Premium cars one Call Away!',
            ],
            'ordering' => [
                'type' => 'both', // both, delivery, takeaway
                'min_order' => 0,
                'delivery_fee' => 150,
                'free_delivery_threshold' => 1500,
                'prep_time_mins' => 35,
                'marketplace_commission_rate' => 25,
            ],
            'payments' => [
                'cod_enabled' => true,
                'bank_transfer_enabled' => false,
                'bank_instructions' => '',
            ],
            'whatsapp' => [
                'order_received' => 'Order {order_number} received!',
                'order_preparing' => 'Order {order_number} is now preparing in the kitchen!',
                'order_ready' => 'Order {order_number} is ready!',
                'order_delivered' => 'Order {order_number} has been delivered!',
            ],
            'crm' => [
                'auto_tag' => 'lead',
            ],
        ];
    }

    /**
     * Fetch settings or return a default model wrapper if empty.
     */
    public function getSettings(string $tenantId, string $status = 'published'): TenantSetting
    {
        $setting = TenantSetting::where('tenant_id', $tenantId)
            ->where('status', $status)
            ->first();

        $tenant = Tenant::find($tenantId);
        $tenantName = $tenant ? $tenant->name : '';

        if (! $setting) {
            $defaults = self::getDefaults();
            $defaults['branding']['business_name'] = $tenantName;
            $setting = new TenantSetting([
                'tenant_id' => $tenantId,
                'status' => $status,
                'branding' => $defaults['branding'],
                'ordering' => $defaults['ordering'],
                'payments' => $defaults['payments'],
                'whatsapp' => $defaults['whatsapp'],
                'crm' => $defaults['crm'],
            ]);
        } else {
            $branding = $setting->branding;
            if (empty($branding['business_name'])) {
                $branding['business_name'] = $tenantName;
                $setting->branding = $branding;
            }
        }

        return $setting;
    }

    /**
     * Copy all fields from draft status to published status.
     */
    public function publish(string $tenantId): void
    {
        $draft = $this->getSettings($tenantId, 'draft');

        // Create or update published record
        TenantSetting::updateOrCreate(
            ['tenant_id' => $tenantId, 'status' => 'published'],
            [
                'branding' => $draft->branding,
                'ordering' => $draft->ordering,
                'payments' => $draft->payments,
                'whatsapp' => $draft->whatsapp,
                'crm' => $draft->crm,
            ]
        );
    }
}
