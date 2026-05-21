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
        Schema::create('parts', function (Blueprint $table) {
            $table->id('part_id');
            $table->string('part_name');
            $table->string('part_number')->unique();
            $table->text('description')->nullable();
            $table->string('unit_of_measure');
            $table->decimal('cost_price', 10, 2);
            $table->decimal('sell_price', 10, 2);
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->integer('reorder_point')->default(0);
            $table->integer('min_stock_level')->default(0);
            $table->integer('max_stock_level')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('supplier_id');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parts');
    }
};
