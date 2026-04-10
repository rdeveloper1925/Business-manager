<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'organization_name' => fake()->optional()->company(),
            'phone_country_name' => 'United States',
            'phone_number' => '('.fake()->numerify('###').')-'.fake()->numerify('###').'-'.fake()->numerify('####'),
            'email' => fake()->unique()->safeEmail(),
            'address' => fake()->address(),
            'tax_id' => fake()->optional()->numerify('##-#######'),
        ];
    }
}
