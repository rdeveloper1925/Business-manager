<?php

namespace App\Http\Requests\SupplierRequests;

use App\Enums\SupplierCategory;
use App\Models\Supplier;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupplierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Supplier::class);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'contact_person_name' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('suppliers', 'email')],
            'address' => ['required', 'string'],
            'category' => ['required', Rule::enum(SupplierCategory::class)],
        ];
    }
}
