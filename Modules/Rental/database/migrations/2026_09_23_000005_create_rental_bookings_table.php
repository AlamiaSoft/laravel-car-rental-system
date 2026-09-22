<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rental_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('booking_number')->nullable();
            $table->foreignId('client_id')->constrained('rental_clients')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->foreignId('third_party_vendor_id')->nullable()->constrained('third_party_vendors')->nullOnDelete();

            $table->string('pricing_mode'); // lumpsum, daily
            $table->decimal('lumpsum_amount', 10, 2)->nullable();
            $table->decimal('daily_driver_rate', 10, 2)->default(6000.00);
            $table->decimal('daily_lunch_rate', 10, 2)->default(500.00);
            $table->integer('number_of_days')->nullable();

            $table->dateTime('start_date');
            $table->dateTime('end_date')->nullable();

            // Fuel & Odometer tracking
            $table->integer('fuel_level_pickup')->nullable(); // 0-100%
            $table->integer('fuel_level_dropoff')->nullable(); // 0-100%
            $table->integer('mileage_pickup')->nullable();
            $table->integer('mileage_dropoff')->nullable();

            // Settlement & Pricing
            $table->decimal('fuel_shortfall_fee', 10, 2)->default(0.00);
            $table->string('fuel_settlement')->default('charged_to_bill'); // charged_to_bill, refilled_by_client, cash_to_driver
            $table->string('status')->default('pending'); // pending, active, completed, cancelled
            $table->decimal('total_cost', 10, 2)->default(0.00);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index('tenant_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_bookings');
    }
};
