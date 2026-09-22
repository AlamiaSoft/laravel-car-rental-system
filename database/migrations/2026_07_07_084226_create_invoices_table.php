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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending')->comment('pending, paid, cancelled');
            $table->date('billing_period_start')->nullable();
            $table->date('billing_period_end')->nullable();
            $table->date('due_date')->nullable();
            $table->string('type')->comment('fixed, commission');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
