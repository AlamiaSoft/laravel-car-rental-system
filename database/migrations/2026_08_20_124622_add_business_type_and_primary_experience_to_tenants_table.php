<?php

use App\Enums\BusinessType;
use App\Models\Tenant;
use App\Services\TenantCapabilityService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('business_type')->default('restaurant')->after('name');
            $table->string('primary_experience')->nullable()->after('business_type');
        });

        // Seed existing tenants with restaurant preset capabilities
        foreach (Tenant::all() as $tenant) {
            app(TenantCapabilityService::class)->applyPreset($tenant, BusinessType::Restaurant);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['business_type', 'primary_experience']);
        });
    }
};
