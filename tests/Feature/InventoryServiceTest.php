<?php

namespace Tests\Feature;

use App\Contracts\Inventory\InventoryServiceInterface;
use App\DataTransferObjects\Inventory\AdjustInventoryData;
use App\DataTransferObjects\Inventory\RecordTransactionData;
use App\Enums\ConditionType;
use App\Enums\TransactionType;
use App\Exceptions\Inventory\InsufficientStockException;
use App\Exceptions\Inventory\InvalidTransactionException;
use App\Models\Inventory;
use App\Models\Part;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class InventoryServiceTest extends TestCase
{
    use RefreshDatabase;

    private InventoryServiceInterface $inventoryService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->inventoryService = $this->app->make(InventoryServiceInterface::class);
    }

    public function test_container_resolves_inventory_service_interface(): void
    {
        $this->assertInstanceOf(InventoryServiceInterface::class, $this->inventoryService);
    }

    public function test_record_transaction_applies_delta_and_persists_transaction(): void
    {
        $user = User::factory()->create();
        $part = $this->createPart();
        $inventory = $this->createInventory($part, quantityOnHand: 10, quantityOnOrder: 50);

        $transaction = $this->inventoryService->recordTransaction(
            $this->transactionData($part->part_id, qtyDelta: 5),
            $user,
        );

        $inventory->refresh();

        $this->assertSame(15, $inventory->quantity_on_hand);
        $this->assertSame(5, $transaction->qty_delta);
        $this->assertSame(15, $transaction->qty_after);
        $this->assertSame($user->id, $transaction->performed_by);
    }

    public function test_record_transaction_throws_when_stock_would_go_negative(): void
    {
        $user = User::factory()->create();
        $part = $this->createPart();
        $this->createInventory($part, quantityOnHand: 3);

        $this->expectException(InsufficientStockException::class);

        $this->inventoryService->recordTransaction(
            $this->transactionData($part->part_id, qtyDelta: -10),
            $user,
        );
    }

    public function test_record_transaction_throws_when_inventory_record_missing(): void
    {
        $user = User::factory()->create();
        $part = $this->createPart();

        $this->expectException(InvalidTransactionException::class);

        $this->inventoryService->recordTransaction(
            $this->transactionData($part->part_id),
            $user,
        );
    }

    public function test_stocktake_sets_latest_count(): void
    {
        $user = User::factory()->create();
        $part = $this->createPart();
        $inventory = $this->createInventory($part, quantityOnHand: 8);

        $this->inventoryService->recordTransaction(
            $this->transactionData(
                $part->part_id,
                qtyDelta: 0,
                transactionType: TransactionType::Stocktake,
            ),
            $user,
        );

        $this->assertNotNull($inventory->refresh()->latest_count);
    }

    public function test_restock_decrements_quantity_on_order(): void
    {
        $user = User::factory()->create();
        $part = $this->createPart();
        $inventory = $this->createInventory($part, quantityOnHand: 10, quantityOnOrder: 40);

        $this->inventoryService->recordTransaction(
            $this->transactionData(
                $part->part_id,
                qtyDelta: 15,
                transactionType: TransactionType::Restock,
            ),
            $user,
        );

        $this->assertSame(25, $inventory->refresh()->quantity_on_hand);
        $this->assertSame(25, $inventory->quantity_on_order);
    }

    public function test_get_low_stock_parts_delegates_to_scope(): void
    {
        $lowPart = $this->createPart(['part_number' => 'PT-LOW-1', 'reorder_point' => 10]);
        $this->createInventory($lowPart, quantityOnHand: 8);

        $okPart = $this->createPart(['part_number' => 'PT-OK-1', 'reorder_point' => 10]);
        $this->createInventory($okPart, quantityOnHand: 20);

        $lowStock = $this->inventoryService->getLowStockParts();

        $this->assertCount(1, $lowStock);
        $this->assertSame($lowPart->part_id, $lowStock->first()->part_id);
        $this->assertTrue($lowStock->first()->relationLoaded('inventory'));
        $this->assertTrue($lowStock->first()->relationLoaded('supplier'));
    }

    public function test_get_stock_summary_returns_dto_with_available_quantity(): void
    {
        $part = $this->createPart(['reorder_point' => 10]);
        $this->createInventory($part, quantityOnHand: 12, quantityReserved: 4, quantityOnOrder: 6);

        $summary = $this->inventoryService->getStockSummary($part);

        $this->assertSame(12, $summary->quantityOnHand);
        $this->assertSame(4, $summary->quantityReserved);
        $this->assertSame(6, $summary->quantityOnOrder);
        $this->assertSame(8, $summary->available);
        $this->assertFalse($summary->isBelowReorder);
    }

    public function test_get_stock_summary_without_inventory_returns_zeroes(): void
    {
        $part = $this->createPart(['reorder_point' => 5]);

        $summary = $this->inventoryService->getStockSummary($part);

        $this->assertSame(0, $summary->quantityOnHand);
        $this->assertSame(0, $summary->available);
        $this->assertFalse($summary->isBelowReorder);
    }

    public function test_adjust_inventory_updates_quantities_atomically(): void
    {
        $user = User::factory()->create();
        $part = $this->createPart();
        $this->createInventory($part, quantityOnHand: 10, quantityReserved: 2, quantityOnOrder: 5);

        $this->inventoryService->adjustInventory(
            new AdjustInventoryData(
                partId: $part->part_id,
                quantityOnHand: 15,
                quantityReserved: 3,
                quantityOnOrder: 8,
                latestCount: null,
            ),
            $user,
        );

        $inventory = Inventory::query()->where('part_id', $part->part_id)->first();

        $this->assertSame(15, $inventory->quantity_on_hand);
        $this->assertSame(3, $inventory->quantity_reserved);
        $this->assertSame(8, $inventory->quantity_on_order);
        $this->assertDatabaseHas('inventory_transactions', [
            'part_id' => $part->part_id,
            'transaction_type' => TransactionType::Adjustment->value,
            'qty_delta' => 5,
            'qty_after' => 15,
        ]);
    }

    public function test_adjust_inventory_throws_when_reserved_exceeds_on_hand(): void
    {
        $user = User::factory()->create();
        $part = $this->createPart();
        $this->createInventory($part, quantityOnHand: 10);

        $this->expectException(InvalidTransactionException::class);

        $this->inventoryService->adjustInventory(
            new AdjustInventoryData(
                partId: $part->part_id,
                quantityOnHand: 10,
                quantityReserved: 11,
                quantityOnOrder: 0,
                latestCount: null,
            ),
            $user,
        );
    }

    public function test_restock_does_not_drive_quantity_on_order_below_zero(): void
    {
        $user = User::factory()->create();
        $part = $this->createPart();
        $inventory = $this->createInventory($part, quantityOnHand: 10, quantityOnOrder: 5);

        $this->inventoryService->recordTransaction(
            $this->transactionData(
                $part->part_id,
                qtyDelta: 20,
                transactionType: TransactionType::Restock,
            ),
            $user,
        );

        $this->assertSame(0, $inventory->refresh()->quantity_on_order);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function transactionData(
        int $partId,
        int $qtyDelta = 1,
        TransactionType $transactionType = TransactionType::Adjustment,
    ): RecordTransactionData {
        return new RecordTransactionData(
            partId: $partId,
            transactionType: $transactionType,
            qtyDelta: $qtyDelta,
            condition: ConditionType::Good,
            transactedAt: Carbon::parse('2026-05-20 12:00:00'),
            supplierId: null,
            referenceId: null,
            referenceType: null,
            unitCost: null,
            notes: null,
        );
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function createPart(array $overrides = []): Part
    {
        return Part::query()->create(array_merge([
            'part_name' => 'Widget',
            'part_number' => 'PT-'.fake()->unique()->numerify('#####'),
            'unit_of_measure' => 'ea',
            'cost_price' => 10.00,
            'sell_price' => 15.00,
            'reorder_point' => 5,
            'min_stock_level' => 0,
            'max_stock_level' => 100,
        ], $overrides));
    }

    private function createInventory(
        Part $part,
        int $quantityOnHand = 0,
        int $quantityReserved = 0,
        int $quantityOnOrder = 0,
    ): Inventory {
        return Inventory::query()->create([
            'part_id' => $part->part_id,
            'quantity_on_hand' => $quantityOnHand,
            'quantity_reserved' => $quantityReserved,
            'quantity_on_order' => $quantityOnOrder,
        ]);
    }
}
