<?php

namespace Database\Seeders;

use App\Models\Parts;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PartsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Parts::factory()->count(100)->create();
    }
}
