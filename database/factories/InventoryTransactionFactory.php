<?php

namespace Database\Factories;

use App\Enums\ConditionType;
use App\Enums\TransactionType;
use App\Models\InventoryTransaction;
use App\Models\Part;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryTransaction>
 */
class InventoryTransactionFactory extends Factory
{
    protected $model = InventoryTransaction::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $qtyDelta = fake()->numberBetween(-20, 20);
        if ($qtyDelta === 0) {
            $qtyDelta = fake()->randomElement([-5, 5, 10, -10]);
        }

        return [
            'part_id' => Part::factory(),
            'supplier_id' => fake()->optional(0.3)->passthrough(
                Supplier::query()->inRandomOrder()->value('id'),
            ),
            'performed_by' => fn (): int => User::query()->inRandomOrder()->value('id')
                ?? User::factory()->create()->id,
            'reference_id' => null,
            'reference_type' => null,
            'transaction_type' => fake()->randomElement(TransactionType::cases()),
            'qty_delta' => $qtyDelta,
            'qty_after' => fake()->numberBetween(0, 200),
            'unit_cost' => fake()->optional()->randomFloat(2, 1, 100),
            'condition' => fake()->randomElement(ConditionType::cases()),
            'notes' => fake()->optional()->sentence(),
            'transacted_at' => fake()->dateTimeBetween('-90 days', 'now'),
        ];
    }
}
