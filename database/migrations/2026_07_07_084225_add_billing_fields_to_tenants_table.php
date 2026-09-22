<?php

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
            $table->string('billing_model')->default('fixed')->comment('fixed or commission');
            $table->decimal('billing_rate', 10, 2)->default(0);
            $table->string('billing_frequency')->default('weekly')->comment('daily, weekly, monthly, manual');
            $table->timestamp('last_billed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['billing_model', 'billing_rate', 'billing_frequency', 'last_billed_at']);
        });
    }
};
