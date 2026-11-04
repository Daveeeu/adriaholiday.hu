<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The booking details a customer gives later; which fields are asked and
 * how their values are checked is decided by BookingDetailsRequestService.
 * Passengers are keyed by their position in the booking.
 */
class CompleteBookingDetailsRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'form_data' => $this->input('form_data', $this->input('formData', [])),
            'passengers' => $this->input('passengers', []),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'form_data' => ['nullable', 'array', 'max:30'],
            'form_data.*' => ['nullable', 'string', 'max:500'],
            'passengers' => ['nullable', 'array', 'max:20'],
            'passengers.*' => ['array', 'max:30'],
            'passengers.*.*' => ['nullable', 'string', 'max:500'],
        ];
    }
}
