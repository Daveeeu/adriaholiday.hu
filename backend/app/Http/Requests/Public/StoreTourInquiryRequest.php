<?php

namespace App\Http\Requests\Public;

use App\Support\Booking\TourInquiry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * A group quote request for a custom date ("egyedi időpont"), available
 * for groups of at least TourInquiry::MIN_PASSENGERS people.
 */
class StoreTourInquiryRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'tour_id' => $this->input('tour_id', $this->input('tourId')),
            'postal_code' => $this->input('postal_code', $this->input('postalCode')),
            'date_from' => $this->input('date_from', $this->input('dateFrom')),
            'date_to' => $this->input('date_to', $this->input('dateTo')),
            'passenger_count' => $this->input('passenger_count', $this->input('passengerCount')),
            'privacy_accepted' => $this->boolean('privacy_accepted', $this->boolean('privacyAccepted')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tour_id' => ['required', 'integer', Rule::exists('tours', 'id')->where('active', true)->whereNull('deleted_at')],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:255'],
            'street' => ['nullable', 'string', 'max:255'],
            'date_from' => ['required', 'date', 'after_or_equal:today'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
            'passenger_count' => ['required', 'integer', 'min:'.TourInquiry::MIN_PASSENGERS, 'max:999'],
            'message' => ['nullable', 'string', 'max:2000'],
            'privacy_accepted' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'tour_id.exists' => 'A kiválasztott utazás nem található.',
            'name.required' => 'A név megadása kötelező.',
            'email.required' => 'Az e-mail cím megadása kötelező.',
            'email.email' => 'Érvénytelen e-mail cím.',
            'date_from.required' => 'A kezdő dátum megadása kötelező.',
            'date_from.after_or_equal' => 'A kezdő dátum nem lehet a múltban.',
            'date_to.required' => 'A záró dátum megadása kötelező.',
            'date_to.after_or_equal' => 'A záró dátum nem lehet korábbi a kezdő dátumnál.',
            'passenger_count.required' => 'Az utasok számának megadása kötelező.',
            'passenger_count.min' => 'Egyedi ajánlat legalább '.TourInquiry::MIN_PASSENGERS.' fő esetén kérhető.',
            'privacy_accepted.accepted' => 'Az adatkezelési tájékoztató elfogadása kötelező.',
        ];
    }
}
