<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->increments('customer_id');
            $table->string('full_name');
            $table->string('organization_name')->nullable();
            $table->string('phone_country_name')->default('Canada');
            $table->string('phone_number');
            $table->string('email');
            $table->text('address');
            $table->string('tax_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique('email');
            $table->index('full_name');
            $table->index('phone_number');
            $table->index('created_at');
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
            DB::statement('CREATE INDEX customers_full_name_trgm_idx ON customers USING gin (full_name gin_trgm_ops)');
            DB::statement('CREATE INDEX customers_email_trgm_idx ON customers USING gin (email gin_trgm_ops)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS customers_email_trgm_idx');
            DB::statement('DROP INDEX IF EXISTS customers_full_name_trgm_idx');
            DB::statement('DROP EXTENSION IF EXISTS pg_trgm');
        }

        Schema::dropIfExists('customers');
    }
};
