<?php

namespace App\Enums;

enum TransactionType: string
{
    case Restock = 'RESTOCK';
    case Sale = 'SALE';
    case Damaged = 'DAMAGED';
    case Adjustment = 'ADJUSTMENT';
    case Return = 'RETURN';
    case Transfer = 'TRANSFER';
    case Stocktake = 'STOCKTAKE';

    public function label(): string
    {
        return match ($this) {
            self::Restock => 'Restock',
            self::Sale => 'Sale',
            self::Damaged => 'Damaged',
            self::Adjustment => 'Adjustment',
            self::Return => 'Return',
            self::Transfer => 'Transfer',
            self::Stocktake => 'Stocktake',
        };
    }
}
