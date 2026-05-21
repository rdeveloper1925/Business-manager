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
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id('transaction_id');
            $table->foreignId('part_id')->constrained('parts', 'part_id');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->foreignId('performed_by')->constrained('users');
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_type')->nullable();
            $table->enum('transaction_type', [
                'RESTOCK',
                'SALE',
                'DAMAGED',
                'ADJUSTMENT',
                'RETURN',
                'TRANSFER',
                'STOCKTAKE',
            ]);
            $table->integer('qty_delta');
            $table->integer('qty_after');
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->enum('condition', ['GOOD', 'DAMAGED', 'DEFECTIVE'])->default('GOOD');
            $table->text('notes')->nullable();
            $table->timestamp('transacted_at');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['part_id', 'transacted_at']);
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
