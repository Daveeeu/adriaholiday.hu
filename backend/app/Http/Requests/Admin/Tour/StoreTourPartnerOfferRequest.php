<?php

namespace App\Http\Requests\Admin\Tour;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTourPartnerOfferRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'active' => $this->boolean('active', true),
            'partner_name' => $this->input('partner_name', $this->input('partnerName')),
            'partner_email' => $this->input('partner_email', $this->input('partnerEmail')),
            'inquiry_date' => $this->input('inquiry_date', $this->input('inquiryDate')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'partner_name' => ['nullable', 'string', 'max:255'],
            'partner_email' => ['nullable', 'email', 'max:255'],
            'inquiry_date' => ['nullable', 'date'],
            'status' => ['required', 'string', Rule::in(['new', 'contacted', 'closed'])],
            'note' => ['nullable', 'string'],
            'active' => ['boolean'],
        ];
    }
}
