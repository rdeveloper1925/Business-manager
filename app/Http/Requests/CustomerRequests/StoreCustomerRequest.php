<?php

namespace App\Http\Requests\CustomerRequests;

use App\Models\Customer;
use App\Support\PhoneCountry;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Customer::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'organization_name' => ['nullable', 'string', 'max:255'],
            'phone_country_name' => ['required', 'string', 'max:255', Rule::in(PhoneCountry::allowedNames())],
            'phone_number' => PhoneCountry::rulesForPhoneNumber($this->input('phone_country_name')),
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('customers', 'email')],
            'address' => ['required', 'string'],
            'tax_id' => ['nullable', 'string', 'max:255'],
        ];
    }
}
