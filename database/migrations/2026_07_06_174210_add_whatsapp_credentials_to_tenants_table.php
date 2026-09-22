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
            $table->string('wa_access_token')->nullable();
            $table->string('wa_phone_number_id')->nullable();
            $table->string('wa_verify_token')->nullable();
            $table->string('wa_app_secret')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['wa_access_token', 'wa_phone_number_id', 'wa_verify_token', 'wa_app_secret']);
        });
    }
};
