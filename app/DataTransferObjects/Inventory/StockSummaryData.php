<?php

namespace App\DataTransferObjects\Inventory;

readonly class StockSummaryData
{
    public function __construct(
        public int $quantityOnHand,
        public int $quantityReserved,
        public int $quantityOnOrder,
        public int $available,
        public bool $isBelowReorder,
    ) {}
}
