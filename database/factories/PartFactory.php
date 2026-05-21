<?php

namespace Database\Factories;

use App\Models\Part;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Part>
 */
class PartFactory extends Factory
{
    protected $model = Part::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $costPrice = fake()->randomFloat(2, 1, 200);

        return [
            'part_name' => fake()->words(3, true),
            'part_number' => 'PT-'.fake()->unique()->numerify('#####'),
            'description' => fake()->optional()->sentence(),
            'unit_of_measure' => fake()->randomElement(['ea', 'box', 'kg', 'm', 'L']),
            'cost_price' => $costPrice,
            'sell_price' => fake()->randomFloat(2, $costPrice + 1, $costPrice + 150),
            'supplier_id' => Supplier::query()->inRandomOrder()->value('id'),
            'reorder_point' => fake()->numberBetween(5, 25),
            'min_stock_level' => fake()->numberBetween(0, 10),
            'max_stock_level' => fake()->numberBetween(50, 500),
        ];
    }
}
