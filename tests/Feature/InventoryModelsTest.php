<?php

namespace Tests\Feature;

use App\Enums\ConditionType;
use App\Enums\TransactionType;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\Part;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryModelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_part_uses_custom_primary_key_and_soft_deletes(): void
    {
        $part = $this->createPart();

        $this->assertSame('part_id', $part->getKeyName());
        $this->assertDatabaseHas('parts', [
            'part_id' => $part->part_id,
            'deleted_at' => null,
        ]);

        $part->delete();

        $this->assertSoftDeleted('parts', ['part_id' => $part->part_id]);
    }

    public function test_part_relationships_resolve_correctly(): void
    {
        $supplier = Supplier::factory()->create();
        $part = $this->createPart(['supplier_id' => $supplier->id]);
        $inventory = Inventory::query()->create([
            'part_id' => $part->part_id,
            'quantity_on_hand' => 10,
        ]);
        $user = User::factory()->create();
        $transaction = InventoryTransaction::query()->create(
            $this->transactionAttributes($part->part_id, $user->id),
        );

        $part->load(['supplier', 'inventory', 'inventoryTransactions']);

        $this->assertTrue($part->supplier->is($supplier));
        $this->assertTrue($part->inventory->is($inventory));
        $this->assertTrue($part->inventoryTransactions->first()->is($transaction));
    }

    public function test_low_stock_scope_filters_parts_at_or_below_reorder_point(): void
    {
        $lowPart = $this->createPart(['reorder_point' => 10]);
        Inventory::query()->create([
            'part_id' => $lowPart->part_id,
            'quantity_on_hand' => 10,
        ]);

        $outPart = $this->createPart(['part_number' => 'PT-00002', 'reorder_point' => 10]);
        Inventory::query()->create([
            'part_id' => $outPart->part_id,
            'quantity_on_hand' => 5,
        ]);

        $okPart = $this->createPart(['part_number' => 'PT-00003', 'reorder_point' => 10]);
        Inventory::query()->create([
            'part_id' => $okPart->part_id,
            'quantity_on_hand' => 11,
        ]);

        $lowStockIds = Part::query()->lowStock()->pluck('part_id')->all();

        $this->assertEqualsCanonicalizing(
            [$lowPart->part_id, $outPart->part_id],
            $lowStockIds,
        );
    }

    public function test_low_stock_scope_ignores_parts_with_zero_reorder_point(): void
    {
        $part = $this->createPart(['part_number' => 'PT-ZERO', 'reorder_point' => 0]);
        Inventory::query()->create([
            'part_id' => $part->part_id,
            'quantity_on_hand' => 0,
        ]);

        $this->assertCount(0, Part::query()->lowStock()->get());
    }

    public function test_inventory_transaction_casts_enums_and_datetime(): void
    {
        $part = $this->createPart();
        $user = User::factory()->create();

        $transaction = InventoryTransaction::query()->create(
            $this->transactionAttributes($part->part_id, $user->id, [
                'transaction_type' => TransactionType::Restock,
                'condition' => ConditionType::Good,
                'transacted_at' => '2026-05-20 14:30:00',
            ]),
        );

        $transaction->refresh();

        $this->assertInstanceOf(TransactionType::class, $transaction->transaction_type);
        $this->assertSame(TransactionType::Restock, $transaction->transaction_type);
        $this->assertInstanceOf(ConditionType::class, $transaction->condition);
        $this->assertSame(ConditionType::Good, $transaction->condition);
        $this->assertSame('2026-05-20 14:30:00', $transaction->transacted_at->format('Y-m-d H:i:s'));
    }

    public function test_transaction_type_and_condition_type_enums_expose_labels(): void
    {
        $this->assertSame('Restock', TransactionType::Restock->label());
        $this->assertSame('Good', ConditionType::Good->label());
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function transactionAttributes(int $partId, int $performedBy, array $overrides = []): array
    {
        return array_merge([
            'part_id' => $partId,
            'performed_by' => $performedBy,
            'transaction_type' => TransactionType::Sale,
            'qty_delta' => -1,
            'qty_after' => 9,
            'condition' => ConditionType::Good,
            'transacted_at' => now(),
        ], $overrides);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function createPart(array $overrides = []): Part
    {
        return Part::query()->create(array_merge([
            'part_name' => 'Widget',
            'part_number' => 'PT-00001',
            'unit_of_measure' => 'ea',
            'cost_price' => 10.00,
            'sell_price' => 15.00,
            'reorder_point' => 5,
            'min_stock_level' => 0,
            'max_stock_level' => 100,
        ], $overrides));
    }
}
