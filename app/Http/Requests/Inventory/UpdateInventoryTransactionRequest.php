<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInventoryTransactionRequest extends FormRequest
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
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'supplier_id' => ['nullable', 'integer', Rule::exists('suppliers', 'id')],
            'notes' => ['nullable', 'string'],
        ];
    }
}
