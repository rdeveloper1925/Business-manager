<?php

namespace App\DataTransferObjects\Inventory;

use App\Http\Requests\Inventory\UpdateInventoryRequest;
use Illuminate\Support\Carbon;

readonly class AdjustInventoryData
{
    public function __construct(
        public int $partId,
        public int $quantityOnHand,
        public int $quantityReserved,
        public int $quantityOnOrder,
        public ?Carbon $latestCount,
    ) {}

    public static function fromRequest(UpdateInventoryRequest $request): static
    {
        $validated = $request->validated();

        return new self(
            partId: (int) $validated['part_id'],
            quantityOnHand: (int) $validated['quantity_on_hand'],
            quantityReserved: (int) $validated['quantity_reserved'],
            quantityOnOrder: (int) $validated['quantity_on_order'],
            latestCount: isset($validated['latest_count'])
                ? Carbon::parse($validated['latest_count'])
                : null,
        );
    }
}
