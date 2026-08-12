<?php

namespace App\Http\Requests\Admin\Booking;

use Illuminate\Foundation\Http\FormRequest;

class StorePromotionRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'title' => $this->input('title'),
            'message' => $this->input('message'),
            'code' => $this->input('code'),
            'is_active' => $this->boolean('is_active', $this->boolean('isActive', true)),
            'starts_at' => $this->input('starts_at', $this->input('startsAt')),
            'expires_at' => $this->input('expires_at', $this->input('expiresAt')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

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
