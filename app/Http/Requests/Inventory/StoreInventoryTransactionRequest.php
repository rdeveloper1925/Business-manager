<?php

namespace App\Http\Requests\Inventory;

use App\Enums\ConditionType;
use App\Enums\TransactionType;
use App\Rules\TransactionDeltaRule;
use App\Support\Inventory\TransactionQtyDelta;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInventoryTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('qty_delta')) {
            $qtyDelta = (int) $this->input('qty_delta');
            $transactionTypeValue = $this->input('transaction_type');

            if (is_string($transactionTypeValue)) {
                try {
                    $qtyDelta = TransactionQtyDelta::normalize(
                        TransactionType::from($transactionTypeValue),
                        $qtyDelta,
                    );
                } catch (\ValueError) {
                    // Validation will reject invalid transaction_type.
                }
            }

            $this->merge([
                'qty_delta' => $qtyDelta,
            ]);
        }

        if ($this->filled('transacted_at')) {
            $this->merge([
                'transacted_at' => $this->date('transacted_at')?->format('Y-m-d H:i:s'),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'part_id' => [
                'required',
                'integer',
                Rule::exists('parts', 'part_id')->whereNull('deleted_at'),
            ],
            'transaction_type' => ['required', Rule::enum(TransactionType::class)],
            'qty_delta' => ['required', 'integer', new TransactionDeltaRule],
            'condition' => ['required', Rule::enum(ConditionType::class)],
            'transacted_at' => ['required', 'date'],
            'supplier_id' => ['nullable', 'integer', Rule::exists('suppliers', 'id')],
            'reference_id' => ['nullable', 'integer'],
            'reference_type' => ['nullable', 'string', 'max:255'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
