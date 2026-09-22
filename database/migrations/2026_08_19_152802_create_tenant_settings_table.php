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
        Schema::create('tenant_settings', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('status')->default('draft'); // 'draft' or 'published'

            // Config groups
            $table->json('branding')->nullable();
            $table->json('ordering')->nullable();
            $table->json('payments')->nullable();
            $table->json('whatsapp')->nullable();
            $table->json('crm')->nullable();

            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['tenant_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_settings');
    }
};
