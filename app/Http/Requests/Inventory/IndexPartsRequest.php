<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexPartsRequest extends FormRequest
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
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'supplier_id' => ['sometimes', 'nullable', 'integer', Rule::exists('suppliers', 'id')],
            'sort' => ['sometimes', 'string', Rule::in([
                'part_name',
                'part_number',
                'cost_price',
                'sell_price',
                'quantity_on_hand',
            ])],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
