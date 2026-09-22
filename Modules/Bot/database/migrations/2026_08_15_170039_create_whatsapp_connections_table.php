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
        Schema::create('whatsapp_connections', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('provider')->default('evolution'); // 'evolution' or 'meta'
            $table->string('instance_name')->unique();
            $table->text('instance_token')->nullable(); // Encrypted instance API key
            $table->string('phone_number')->nullable();
            $table->string('status')->default('disconnected'); // 'connecting', 'open', 'close', 'refused'
            $table->string('evolution_instance_id')->nullable();
            $table->text('qrcode')->nullable(); // Base64 QR code
            $table->timestamp('connected_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_connections');
    }
};
