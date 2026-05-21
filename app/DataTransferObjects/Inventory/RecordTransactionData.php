<?php

namespace App\DataTransferObjects\Inventory;

use App\Enums\ConditionType;
use App\Enums\TransactionType;
use App\Http\Requests\Inventory\StoreInventoryTransactionRequest;
use Illuminate\Support\Carbon;

readonly class RecordTransactionData
{
    public function __construct(
        public int $partId,
        public TransactionType $transactionType,
        public int $qtyDelta,
        public ConditionType $condition,
        public Carbon $transactedAt,
        public ?int $supplierId,
        public ?int $referenceId,
        public ?string $referenceType,
        public ?float $unitCost,
        public ?string $notes,
    ) {}

    public static function fromRequest(StoreInventoryTransactionRequest $request): static
    {
        $validated = $request->validated();

        return new self(
            partId: (int) $validated['part_id'],
            transactionType: $validated['transaction_type'] instanceof TransactionType
                ? $validated['transaction_type']
                : TransactionType::from($validated['transaction_type']),
            qtyDelta: (int) $validated['qty_delta'],
            condition: $validated['condition'] instanceof ConditionType
                ? $validated['condition']
                : ConditionType::from($validated['condition']),
            transactedAt: Carbon::parse($validated['transacted_at']),
            supplierId: isset($validated['supplier_id']) ? (int) $validated['supplier_id'] : null,
            referenceId: isset($validated['reference_id']) ? (int) $validated['reference_id'] : null,
            referenceType: $validated['reference_type'] ?? null,
            unitCost: isset($validated['unit_cost']) ? (float) $validated['unit_cost'] : null,
            notes: $validated['notes'] ?? null,
        );
    }
}
