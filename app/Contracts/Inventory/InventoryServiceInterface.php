<?php

namespace App\Contracts\Inventory;

use App\DataTransferObjects\Inventory\AdjustInventoryData;
use App\DataTransferObjects\Inventory\RecordTransactionData;
use App\DataTransferObjects\Inventory\StockSummaryData;
use App\Models\InventoryTransaction;
use App\Models\Part;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface InventoryServiceInterface
{
    public function recordTransaction(RecordTransactionData $data, User $performedBy): InventoryTransaction;

    public function adjustInventory(AdjustInventoryData $data, User $performedBy): void;

    /**
     * @return Collection<int, Part>
     */
    public function getLowStockParts(int $limit = 25): Collection;

    /**
     * @return array{totalParts: int, totalSkusInStock: int, lowStockAlerts: int, pendingOrders: int}
     */
    public function getDashboardSummary(): array;

    public function getStockSummary(Part $part): StockSummaryData;
}
