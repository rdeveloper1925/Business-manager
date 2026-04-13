<?php

namespace Database\Factories;

use App\Enums\PartDesignation;
use App\Models\Parts;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Parts>
 */
class PartsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'part_number' => fake()->unique()->bothify('PN-####-????'),
            'part_name' => fake()->words(3, true),
            'unit_of_measure' => fake()->randomElement(['ea', 'box', 'pair', 'set', 'kg']),
            'description' => fake()->optional()->sentence(),
            'car_make' => fake()->optional()->randomElement(['Toyota', 'Ford', 'Honda', 'GM']),
            'car_model' => fake()->optional()->word(),
            'car_year' => fake()->optional()->numberBetween(1990, (int) date('Y') + 1),
            'designation' => fake()->randomElement(PartDesignation::cases()),
            'supplier' => fake()->optional()->company(),
            'alternatives' => fake()->optional()->regexify('[A-Z0-9]{4,8},[A-Z0-9]{4,8}'),
            'market_price' => fake()->optional()->randomFloat(2, 5, 500),
            'created_by' => User::factory(),
        ];
    }
}
