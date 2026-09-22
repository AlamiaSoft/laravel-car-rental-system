<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_requests', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('source')->default('whatsapp'); // whatsapp, manual, pwa
            $table->string('from_phone');
            $table->string('from_name')->nullable();
            $table->text('message_text');
            $table->foreignId('suggested_vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('suggested_driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->string('status')->default('unmatched'); // matched, unmatched, converted, rejected
            $table->foreignId('booking_id')->nullable()->constrained('rental_bookings')->nullOnDelete();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index('tenant_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_requests');
    }
};
