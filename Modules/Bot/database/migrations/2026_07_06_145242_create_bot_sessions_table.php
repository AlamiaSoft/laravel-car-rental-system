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
        Schema::create('bot_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('phone_number')->index();
            $table->string('tenant_id'); // String for stancl/tenancy v4
            $table->string('current_state')->default('START');
            $table->json('context')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->unique(['phone_number', 'tenant_id']);
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bot_sessions');
    }
};
