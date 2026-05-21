<?php

namespace Tests\Feature;

use App\DataTransferObjects\Inventory\RecordTransactionData;
use App\DataTransferObjects\Inventory\StockSummaryData;
use App\Enums\ConditionType;
use App\Enums\TransactionType;
use App\Http\Requests\Inventory\StoreInventoryTransactionRequest;
use App\Models\Part;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryDataTransferObjectsTest extends TestCase
{
    use RefreshDatabase;

    public function test_stock_summary_data_exposes_readonly_properties(): void
    {
        $summary = new StockSummaryData(
            quantityOnHand: 20,
            quantityReserved: 5,
            quantityOnOrder: 10,
            available: 15,
            isBelowReorder: false,
        );

        $this->assertSame(20, $summary->quantityOnHand);
        $this->assertSame(5, $summary->quantityReserved);
        $this->assertSame(10, $summary->quantityOnOrder);
        $this->assertSame(15, $summary->available);
        $this->assertFalse($summary->isBelowReorder);
    }

    public function test_record_transaction_data_maps_from_validated_request(): void
    {
        $user = User::factory()->create();
        $part = Part::query()->create([
            'part_name' => 'Widget',
            'part_number' => 'PT-00001',
            'unit_of_measure' => 'ea',
            'cost_price' => 10.00,
            'sell_price' => 15.00,
        ]);

        $request = $this->makeStoreInventoryTransactionRequest($user, [
            'part_id' => $part->part_id,
            'transaction_type' => TransactionType::Restock->value,
            'qty_delta' => 25,
            'condition' => ConditionType::Good->value,
            'transacted_at' => '2026-05-20T14:30:00',
            'unit_cost' => 9.50,
            'notes' => 'Initial stock',
        ]);

        $dto = RecordTransactionData::fromRequest($request);

        $this->assertSame($part->part_id, $dto->partId);
        $this->assertSame(TransactionType::Restock, $dto->transactionType);
        $this->assertSame(25, $dto->qtyDelta);
        $this->assertSame(ConditionType::Good, $dto->condition);
        $this->assertSame('2026-05-20 14:30:00', $dto->transactedAt->format('Y-m-d H:i:s'));
        $this->assertNull($dto->supplierId);
        $this->assertNull($dto->referenceId);
        $this->assertNull($dto->referenceType);
        $this->assertSame(9.5, $dto->unitCost);
        $this->assertSame('Initial stock', $dto->notes);
    }

    public function test_store_inventory_transaction_request_prepares_qty_delta_and_transacted_at(): void
    {
        $user = User::factory()->create();
        $part = Part::query()->create([
            'part_name' => 'Widget',
            'part_number' => 'PT-00002',
            'unit_of_measure' => 'ea',
            'cost_price' => 10.00,
            'sell_price' => 15.00,
        ]);

        $request = $this->makeStoreInventoryTransactionRequest($user, [
            'part_id' => $part->part_id,
            'transaction_type' => TransactionType::Sale->value,
            'qty_delta' => '3',
            'condition' => ConditionType::Good->value,
            'transacted_at' => '2026-05-20',
        ]);

        $this->assertSame(3, RecordTransactionData::fromRequest($request)->qtyDelta);
        $this->assertSame('2026-05-20 00:00:00', RecordTransactionData::fromRequest($request)->transactedAt->format('Y-m-d H:i:s'));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function makeStoreInventoryTransactionRequest(User $user, array $data): StoreInventoryTransactionRequest
    {
        $request = StoreInventoryTransactionRequest::create('/', 'POST', $data);
        $request->setContainer($this->app);
        $request->setRedirector($this->app->make('redirect'));
        $request->setUserResolver(fn (): User => $user);

        $request->validateResolved();

        return $request;
    }
}
