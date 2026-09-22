<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rental_payments', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('booking_id')->constrained('rental_bookings')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('method'); // cash, jazzcash, easypaisa, bank_transfer
            $table->string('status')->default('pending'); // pending, paid, refunded, failed
            $table->string('transaction_ref')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index('tenant_id');
            $table->index('booking_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_payments');
    }
};
