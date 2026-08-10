<?php

namespace App\Http\Requests\Admin\Booking;

class UpdatePromotionRequest extends StorePromotionRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'code' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ];
    }
}
