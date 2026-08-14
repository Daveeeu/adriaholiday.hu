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
            'starts_at' => $this->input('starts_at', $this->input('startsAt')),
            'expires_at' => $this->input('expires_at', $this->input('expiresAt')),
            'usage_conditions' => $this->input('usage_conditions', $this->input('usageConditions')),
            'used' => $this->boolean('used', false),
            'max_uses' => $this->input('max_uses', $this->input('maxUses')),
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
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'usage_conditions' => ['nullable', 'string'],
            'used' => ['boolean'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
