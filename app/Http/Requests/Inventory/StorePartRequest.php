<?php

namespace App\Http\Requests\Inventory;

use App\Enums\PartDesignation;
use App\Models\Parts;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePartRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Parts::class);
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->has('car_year') && $this->input('car_year') === '') {
            $merge['car_year'] = null;
        }

        if ($this->has('market_price') && $this->input('market_price') === '') {
            $merge['market_price'] = null;
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'part_number' => ['required', 'string', 'max:255', Rule::unique('parts', 'part_number')],
            'part_name' => ['required', 'string', 'max:255'],
            'unit_of_measure' => ['required', 'string', 'max:64'],
            'description' => ['nullable', 'string'],
            'car_make' => ['nullable', 'string', 'max:255'],
            'car_model' => ['nullable', 'string', 'max:255'],
            'car_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'designation' => ['required', Rule::enum(PartDesignation::class)],
            'supplier' => ['nullable', 'string', 'max:255'],
            'alternatives' => ['nullable', 'string'],
            'market_price' => ['nullable', 'numeric', 'min:0', 'decimal:0,2'],
        ];
    }
}
