<?php

namespace App\Http\Requests\Customers;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexCustomersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, ValidationRule|string>>
     */
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sort' => ['sometimes', 'string', Rule::in(['full_name', 'phone_number', 'email'])],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'view' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'edit' => ['sometimes', 'nullable', 'integer', 'min:1'],
        ];
    }
}
