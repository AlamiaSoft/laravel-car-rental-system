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
        Schema::create('bot_workflows', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->nullable(); // null = system global template workflow
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(false);
            $table->json('trigger_keywords')->nullable();
            $table->json('nodes_schema');
            $table->json('edges_schema')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::table('bot_sessions', function (Blueprint $table) {
            $table->foreignId('workflow_id')->nullable()->constrained('bot_workflows')->nullOnDelete();
            $table->string('current_node_key')->nullable()->after('current_state');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bot_sessions', function (Blueprint $table) {
            $table->dropForeign(['workflow_id']);
            $table->dropColumn(['workflow_id', 'current_node_key']);
        });

        Schema::dropIfExists('bot_workflows');
    }
};
