<?php

namespace App\Http\Requests\Admin\Booking;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePartnerFinanceRecordRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'partner_name' => $this->input('partner_name', $this->input('partnerName')),
            'date' => $this->input('date'),
            'amount' => $this->input('amount'),
            'type' => $this->input('type'),
            'status' => $this->input('status', 'pending'),
            'balance' => $this->input('balance'),
            'note' => $this->input('note'),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'partner_name' => ['required', 'string', 'max:255'],
            'date' => ['nullable', 'date'],
            'amount' => ['required', 'numeric'],
            'type' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:255'],
            'balance' => ['nullable', 'numeric'],
            'note' => ['nullable', 'string'],
        ];
    }
}
