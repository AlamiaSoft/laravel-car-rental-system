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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('order_number')->unique();
            $table->string('customer_phone')->nullable();
            $table->string('customer_name')->nullable();
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', ['Pending', 'Preparing', 'Ready', 'Delivered'])->default('Pending');
            $table->string('order_type')->default('WhatsApp');
            $table->text('delivery_address')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
