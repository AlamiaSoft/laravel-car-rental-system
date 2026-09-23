<?php

use App\Enums\BusinessType;
use App\Enums\TenantCapability;
use App\Models\Tenant;
use App\Services\TenantCapabilityService;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $capabilityService = app(TenantCapabilityService::class);

        foreach (Tenant::all() as $tenant) {
            // In the Car Rental System, all tenants must have the Car Rental preset
            if ($tenant->business_type === BusinessType::Restaurant->value 
                || empty($tenant->business_type) 
                || ! $tenant->hasCapability(TenantCapability::Rentals)) {
                $capabilityService->applyPreset($tenant, BusinessType::CarRental);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
