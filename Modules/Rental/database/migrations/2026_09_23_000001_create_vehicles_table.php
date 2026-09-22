<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('plate_number');
            $table->string('model');
            $table->integer('year')->nullable();
            $table->string('status')->default('available'); // available, rented, maintenance
            $table->integer('mileage')->default(0);
            $table->decimal('fuel_tank_capacity', 5, 2)->nullable(); // e.g. 45.00 liters
            $table->string('gps_device_id')->nullable();
            $table->integer('next_service_due_mileage')->nullable();
            $table->decimal('daily_rate', 10, 2)->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['tenant_id', 'plate_number']);
            $table->index('tenant_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
