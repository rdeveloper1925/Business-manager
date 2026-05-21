<?php

namespace App\Http\Requests\Inventory;

use App\Enums\ConditionType;
use App\Enums\TransactionType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexInventoryTransactionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'part_id' => ['sometimes', 'nullable', 'integer', Rule::exists('parts', 'part_id')],
            'transaction_types' => ['sometimes', 'nullable', 'array'],
            'transaction_types.*' => ['string', Rule::enum(TransactionType::class)],
            'condition' => ['sometimes', 'nullable', 'string', Rule::enum(ConditionType::class)],
            'date_from' => ['sometimes', 'nullable', 'date'],
            'date_to' => ['sometimes', 'nullable', 'date', 'after_or_equal:date_from'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
