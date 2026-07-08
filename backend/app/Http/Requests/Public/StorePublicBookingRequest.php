<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePublicBookingRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'tour_id' => $this->input('tour_id', $this->input('tourId')),
            'tour_date_id' => $this->input('tour_date_id', $this->input('tourDateId')),
            'participants' => $this->input('participants'),
            'form_data' => $this->input('form_data', $this->input('formData', [])),
            'passengers' => $this->input('passengers', []),
            'note' => $this->input('note'),
            'type' => $this->input('type', 'tour_booking'),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tour_id' => ['required', 'integer', 'exists:tours,id'],
            'tour_date_id' => ['nullable', 'integer', 'exists:tour_dates,id'],
            'participants' => ['nullable', 'integer', 'min:1'],
            'form_data' => ['nullable', 'array'],
            'passengers' => ['nullable', 'array'],
            'passengers.*' => ['array'],
            'note' => ['nullable', 'string', 'max:2000'],
            'type' => ['nullable', 'string', Rule::in(['tour_booking', 'tour_inquiry'])],
        ];
    }
}
