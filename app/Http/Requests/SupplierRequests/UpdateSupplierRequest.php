<?php

namespace App\Http\Requests\SupplierRequests;

use App\Enums\SupplierCategory;
use App\Models\Supplier;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupplierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var Supplier $supplier */
        $supplier = $this->route('supplier');

        return $this->user()->can('update', $supplier);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Supplier $supplier */
        $supplier = $this->route('supplier');

        return [
            'contact_person_name' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('suppliers', 'email')->ignore($supplier->getKey(), 'id'),
            ],
            'address' => ['required', 'string'],
            'category' => ['required', Rule::enum(SupplierCategory::class)],
        ];
    }
}
