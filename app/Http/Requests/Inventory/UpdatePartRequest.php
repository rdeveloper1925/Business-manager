<?php

namespace App\Http\Requests\Inventory;

use App\Models\Part;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePartRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Part $part */
        $part = $this->route('part');

        return [
            'part_name' => ['required', 'string', 'max:255'],
            'part_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('parts', 'part_number')->ignore($part->part_id, 'part_id'),
            ],
            'description' => ['nullable', 'string'],
            'unit_of_measure' => ['required', 'string', 'max:255'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'sell_price' => ['required', 'numeric', 'min:0'],
            'supplier_id' => ['nullable', 'integer', Rule::exists('suppliers', 'id')],
            'reorder_point' => ['nullable', 'integer', 'min:0'],
            'min_stock_level' => ['nullable', 'integer', 'min:0'],
            'max_stock_level' => ['nullable', 'integer', 'min:0', 'gte:min_stock_level'],
        ];
    }
}
