<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
        DB::statement('CREATE INDEX customers_full_name_trgm_idx ON customers USING gin (full_name gin_trgm_ops)');
        DB::statement('CREATE INDEX customers_email_trgm_idx ON customers USING gin (email gin_trgm_ops)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('DROP INDEX IF EXISTS customers_email_trgm_idx');
        DB::statement('DROP INDEX IF EXISTS customers_full_name_trgm_idx');
        DB::statement('DROP EXTENSION IF EXISTS pg_trgm');
    }
};
