<?php

namespace App\Support\Inventory;

use App\Enums\TransactionType;

final class TransactionQtyDelta
{
    public static function normalize(TransactionType $transactionType, int $qtyDelta): int
    {
        return match ($transactionType) {
            TransactionType::Restock, TransactionType::Return => abs($qtyDelta),
            TransactionType::Sale, TransactionType::Damaged => -abs($qtyDelta),
            default => $qtyDelta,
        };
    }
}
