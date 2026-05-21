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
        Schema::table('inventory', function (Blueprint $table) {
            $table->index('quantity_on_hand');
        });

        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->index('transaction_type');
            $table->index('performed_by');
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory', function (Blueprint $table) {
            $table->dropIndex(['quantity_on_hand']);
        });

        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->dropIndex(['transaction_type']);
            $table->dropIndex(['performed_by']);
            $table->dropIndex(['reference_type', 'reference_id']);
        });
    }
};
