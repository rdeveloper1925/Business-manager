<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\Part;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inventory>
 */
class InventoryFactory extends Factory
{
    protected $model = Inventory::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantityOnHand = fake()->numberBetween(0, 200);
        $quantityReserved = fake()->numberBetween(0, $quantityOnHand);

        return [
            'part_id' => Part::factory(),
            'quantity_on_hand' => $quantityOnHand,
            'quantity_reserved' => $quantityReserved,
            'quantity_on_order' => fake()->numberBetween(0, 50),
            'latest_count' => fake()->optional(0.7)->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
