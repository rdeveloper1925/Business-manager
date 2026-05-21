<?php

namespace App\Services;

use App\Contracts\Inventory\InventoryServiceInterface;
use App\DataTransferObjects\Inventory\AdjustInventoryData;
use App\DataTransferObjects\Inventory\RecordTransactionData;
use App\DataTransferObjects\Inventory\StockSummaryData;
use App\Enums\ConditionType;
use App\Enums\TransactionType;
use App\Exceptions\Inventory\InsufficientStockException;
use App\Exceptions\Inventory\InvalidTransactionException;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\Part;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class InventoryService implements InventoryServiceInterface
{
    public function __construct(
        private readonly Part $partModel,
        private readonly Inventory $inventoryModel,
        private readonly InventoryTransaction $transactionModel,
    ) {}

    public function recordTransaction(RecordTransactionData $data, User $performedBy): InventoryTransaction
    {
        return DB::transaction(function () use ($data, $performedBy): InventoryTransaction {
            $this->partModel->newQuery()->findOrFail($data->partId);

            $inventory = $this->lockInventoryForPart($data->partId);

            return $this->persistTransaction($inventory, $data, $performedBy);
        });
    }

    public function adjustInventory(AdjustInventoryData $data, User $performedBy): void
    {
        DB::transaction(function () use ($data, $performedBy): void {
            $this->partModel->newQuery()->findOrFail($data->partId);

            $inventory = $this->lockInventoryForPart($data->partId);

            if ($data->quantityReserved > $data->quantityOnHand) {
                throw new InvalidTransactionException(
                    'Reserved quantity cannot exceed quantity on hand.',
                );
            }

            $delta = $data->quantityOnHand - $inventory->quantity_on_hand;

            if ($delta !== 0) {
                $this->persistTransaction(
                    $inventory,
                    new RecordTransactionData(
                        partId: $data->partId,
                        transactionType: TransactionType::Adjustment,
                        qtyDelta: $delta,
                        condition: ConditionType::Good,
                        transactedAt: Carbon::now(),
                        supplierId: null,
                        referenceId: null,
                        referenceType: null,
                        unitCost: null,
                        notes: __('Manual stock adjustment.'),
                    ),
                    $performedBy,
                );

                $inventory->refresh();
            }

            $inventory->update([
                'quantity_reserved' => $data->quantityReserved,
                'quantity_on_order' => $data->quantityOnOrder,
                'latest_count' => $data->latestCount ?? $inventory->latest_count,
            ]);
        });
    }

    /**
     * @return Collection<int, Part>
     */
    public function getLowStockParts(int $limit = 25): Collection
    {
        return $this->partModel->newQuery()
            ->lowStock()
            ->with(['inventory', 'supplier'])
            ->limit($limit)
            ->get();
    }

    /**
     * @return array{totalParts: int, totalSkusInStock: int, lowStockAlerts: int, pendingOrders: int}
     */
    public function getDashboardSummary(): array
    {
        $inventoryTable = $this->inventoryModel->getTable();
        $partsTable = $this->partModel->getTable();

        $stats = DB::table($partsTable)
            ->leftJoin($inventoryTable, "{$partsTable}.part_id", '=', "{$inventoryTable}.part_id")
            ->whereNull("{$partsTable}.deleted_at")
            ->selectRaw('COUNT(*) as total_parts')
            ->selectRaw("SUM(CASE WHEN {$inventoryTable}.quantity_on_hand > 0 THEN 1 ELSE 0 END) as total_skus_in_stock")
            ->selectRaw("SUM(CASE WHEN {$partsTable}.reorder_point > 0 AND {$inventoryTable}.quantity_on_hand <= {$partsTable}.reorder_point THEN 1 ELSE 0 END) as low_stock_alerts")
            ->selectRaw("COALESCE(SUM({$inventoryTable}.quantity_on_order), 0) as pending_orders")
            ->first();

        return [
            'totalParts' => (int) ($stats->total_parts ?? 0),
            'totalSkusInStock' => (int) ($stats->total_skus_in_stock ?? 0),
            'lowStockAlerts' => (int) ($stats->low_stock_alerts ?? 0),
            'pendingOrders' => (int) ($stats->pending_orders ?? 0),
        ];
    }

    public function getStockSummary(Part $part): StockSummaryData
    {
        $part->loadMissing('inventory');

        $inventory = $part->inventory;

        if ($inventory === null) {
            return new StockSummaryData(
                quantityOnHand: 0,
                quantityReserved: 0,
                quantityOnOrder: 0,
                available: 0,
                isBelowReorder: false,
            );
        }

        $quantityOnHand = $inventory->quantity_on_hand;
        $quantityReserved = $inventory->quantity_reserved;

        return new StockSummaryData(
            quantityOnHand: $quantityOnHand,
            quantityReserved: $quantityReserved,
            quantityOnOrder: $inventory->quantity_on_order,
            available: $quantityOnHand - $quantityReserved,
            isBelowReorder: $part->reorder_point > 0 && $quantityOnHand <= $part->reorder_point,
        );
    }

    private function lockInventoryForPart(int $partId): Inventory
    {
        $inventory = $this->inventoryModel->newQuery()
            ->where('part_id', $partId)
            ->lockForUpdate()
            ->first();

        if ($inventory === null) {
            throw new InvalidTransactionException(
                "No inventory record exists for part [{$partId}].",
            );
        }

        return $inventory;
    }

    private function persistTransaction(
        Inventory $inventory,
        RecordTransactionData $data,
        User $performedBy,
    ): InventoryTransaction {
        $quantityAfter = $inventory->quantity_on_hand + $data->qtyDelta;

        if ($quantityAfter < 0) {
            throw new InsufficientStockException(
                partId: $data->partId,
                requestedDelta: $data->qtyDelta,
                quantityOnHand: $inventory->quantity_on_hand,
            );
        }

        $transaction = $this->transactionModel->newQuery()->create([
            'part_id' => $data->partId,
            'supplier_id' => $data->supplierId,
            'performed_by' => $performedBy->getKey(),
            'reference_id' => $data->referenceId,
            'reference_type' => $data->referenceType,
            'transaction_type' => $data->transactionType,
            'qty_delta' => $data->qtyDelta,
            'qty_after' => $quantityAfter,
            'unit_cost' => $data->unitCost,
            'condition' => $data->condition,
            'notes' => $data->notes,
            'transacted_at' => $data->transactedAt,
        ]);

        $this->applyDelta($inventory, $data->qtyDelta);

        if ($data->transactionType === TransactionType::Stocktake) {
            $inventory->update(['latest_count' => now()]);
        }

        if ($data->transactionType === TransactionType::Restock) {
            $newOnOrder = max(0, $inventory->quantity_on_order - $data->qtyDelta);
            $inventory->update(['quantity_on_order' => $newOnOrder]);
        }

        return $transaction;
    }

    private function applyDelta(Inventory $inventory, int $delta): void
    {
        $inventory->increment('quantity_on_hand', $delta);
    }
}
