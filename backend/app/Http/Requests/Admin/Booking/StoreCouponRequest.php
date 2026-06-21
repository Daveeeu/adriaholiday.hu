<?php

namespace App\Http\Requests\Admin\Booking;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCouponRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'active' => $this->boolean('active', true),
            'name' => $this->input('name'),
            'email' => $this->input('email'),
            'code' => $this->input('code'),
            'value' => $this->input('value'),
            'expires_at' => $this->input('expires_at', $this->input('expiresAt')),
            'used' => $this->boolean('used', false),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'active' => ['boolean'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'code' => ['required', 'string', 'max:255', Rule::unique('coupons', 'code')],
            'value' => ['nullable', 'numeric'],
            'expires_at' => ['nullable', 'date'],
            'used' => ['boolean'],
        ];
    }
}
