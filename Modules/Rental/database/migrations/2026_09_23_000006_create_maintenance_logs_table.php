<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->string('type'); // oil_change, brake_service, tire_replacement, engine_tuning, inspection
            $table->integer('mileage_at_service');
            $table->integer('next_due_mileage')->nullable();
            $table->decimal('cost', 10, 2)->default(0.00);
            $table->text('notes')->nullable();
            $table->dateTime('service_date');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index('tenant_id');
            $table->index('vehicle_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
