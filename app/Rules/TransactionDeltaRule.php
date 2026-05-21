<?php

namespace App\Rules;

use App\Enums\TransactionType;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class TransactionDeltaRule implements ValidationRule
{
    /**
     * @param  Closure(string, ?string=): void  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_numeric($value)) {
            return;
        }

        $qtyDelta = (int) $value;
        $transactionTypeValue = request()->input('transaction_type');

        if (! is_string($transactionTypeValue)) {
            return;
        }

        try {
            $transactionType = TransactionType::from($transactionTypeValue);
        } catch (\ValueError) {
            return;
        }

        if ($transactionType === TransactionType::Stocktake && $qtyDelta === 0) {
            return;
        }

        if ($qtyDelta === 0) {
            $fail('The quantity change must not be zero for this transaction type.');

            return;
        }

        $mustBePositive = match ($transactionType) {
            TransactionType::Restock, TransactionType::Return => true,
            TransactionType::Sale, TransactionType::Damaged => false,
            default => null,
        };

        if ($mustBePositive === true && $qtyDelta < 0) {
            $fail('The quantity change must be positive for this transaction type.');
        }

        if ($mustBePositive === false && $qtyDelta > 0) {
            $fail('The quantity change must be negative for this transaction type.');
        }
    }
}
