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
            $table->id();
            $table->string('part_number')->unique();
            $table->string('part_name');
            $table->string('unit_of_measure');
            $table->text('description')->nullable();
            $table->string('car_make')->nullable();
            $table->string('car_model')->nullable();
            $table->unsignedSmallInteger('car_year')->nullable();
            $table->string('designation');
            $table->string('supplier')->nullable();
            $table->text('alternatives')->nullable();
            $table->decimal('market_price', 12, 2)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
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
