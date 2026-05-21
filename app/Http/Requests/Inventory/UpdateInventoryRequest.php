<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInventoryRequest extends FormRequest
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
        if ($this->filled('latest_count')) {
            $this->merge([
                'latest_count' => $this->date('latest_count')?->format('Y-m-d H:i:s'),
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
            'quantity_on_hand' => ['required', 'integer', 'min:0'],
            'quantity_reserved' => ['required', 'integer', 'min:0', 'lte:quantity_on_hand'],
            'quantity_on_order' => ['required', 'integer', 'min:0'],
            'latest_count' => ['nullable', 'date'],
        ];
    }
}
