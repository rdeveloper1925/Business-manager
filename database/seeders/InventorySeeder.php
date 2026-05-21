<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\Part;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (User::query()->doesntExist()) {
            User::factory()->create([
                'name' => 'Inventory User',
                'email' => 'inventory@example.com',
            ]);
        }

        if (Supplier::query()->doesntExist()) {
            Supplier::factory(10)->create();
        }

        Part::factory(30)
            ->create()
            ->each(function (Part $part): void {
                $quantityOnHand = fake()->numberBetween(0, 150);
                $quantityReserved = fake()->numberBetween(0, $quantityOnHand);

                $inventory = Inventory::factory()->create([
                    'part_id' => $part->part_id,
                    'quantity_on_hand' => $quantityOnHand,
                    'quantity_reserved' => $quantityReserved,
                    'quantity_on_order' => fake()->numberBetween(0, 40),
                    'latest_count' => fake()->optional(0.5)->dateTimeBetween('-60 days', 'now'),
                ]);

                $runningTotal = $quantityOnHand;
                $transactionCount = fake()->numberBetween(5, 10);

                for ($i = 0; $i < $transactionCount; $i++) {
                    $delta = fake()->numberBetween(-15, 15);

                    if ($delta === 0) {
                        continue;
                    }

                    $runningTotal = max(0, $runningTotal + $delta);

                    InventoryTransaction::factory()->create([
                        'part_id' => $part->part_id,
                        'qty_delta' => $delta,
                        'qty_after' => $runningTotal,
                        'transacted_at' => fake()->dateTimeBetween('-90 days', 'now'),
                    ]);
                }

                $inventory->update(['quantity_on_hand' => $runningTotal]);
            });
    }
}
