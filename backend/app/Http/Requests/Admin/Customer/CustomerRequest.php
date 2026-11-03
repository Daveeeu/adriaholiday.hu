<?php

namespace App\Http\Requests\Admin\Customer;

use App\Models\Customer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The customer form, for creating and editing alike.
 */
class CustomerRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => mb_strtolower(trim((string) $this->input('email', ''))),
            'postal_code' => $this->input('postal_code', $this->input('postalCode')),
            'referral_code' => $this->input('referral_code', $this->input('referralCode')),
            'registration_coupon_value' => $this->input('registration_coupon_value', $this->input('registrationCouponValue')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Customer|null $customer */
        $customer = $this->route('customer');

        return [
            'email' => ['required', 'email', 'max:255', Rule::unique('customers', 'email')->ignore($customer?->id)],
            'name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64'],
            'postal_code' => ['nullable', 'string', 'max:16'],
            'city' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'referral_code' => ['nullable', 'string', 'max:32', Rule::unique('customers', 'referral_code')->ignore($customer?->id)],
            'registration_coupon_value' => ['nullable', 'integer', 'min:0'],
            'note' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
