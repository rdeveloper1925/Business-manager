<?php

namespace App\Exceptions\Inventory;

use Exception;

class InsufficientStockException extends Exception
{
    public function __construct(
        public readonly int $partId,
        public readonly int $requestedDelta,
        public readonly int $quantityOnHand,
    ) {
        parent::__construct(
            "Insufficient stock for part [{$partId}]: cannot apply delta of {$requestedDelta} to on-hand quantity of {$quantityOnHand}.",
        );
    }
}
