<?php

namespace App\Http\Requests\Admin\Booking;

use Illuminate\Validation\Rule;

class UpdateCouponRequest extends StoreCouponRequest
{
    public function rules(): array
    {
        $couponId = $this->route('coupon')?->id ?? $this->route('coupon');

        return [
            'active' => ['boolean'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'code' => ['required', 'string', 'max:255', Rule::unique('coupons', 'code')->ignore($couponId)],
            'value' => ['nullable', 'numeric'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'usage_conditions' => ['nullable', 'string'],
            'used' => ['boolean'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
