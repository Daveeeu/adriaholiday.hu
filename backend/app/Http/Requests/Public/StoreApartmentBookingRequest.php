<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

/**
 * A booking request from an apartment's page: the customer, the stay, the
 * guests, the apartment type and the insurances asked for.
 */
class StoreApartmentBookingRequest extends FormRequest
{
    public const MAX_GUESTS = 20;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'customer_name' => $this->input('customer_name', $this->input('customerName')),
            'postal_code' => $this->input('postal_code', $this->input('postalCode')),
            'apartment_type' => $this->input('apartment_type', $this->input('apartmentType')),
            'travel_insurance' => $this->boolean('travel_insurance', $this->boolean('travelInsurance')),
            'cancellation_insurance' => $this->boolean('cancellation_insurance', $this->boolean('cancellationInsurance')),
            'terms_accepted' => $this->boolean('terms_accepted', $this->boolean('termsAccepted')),
            'newsletter_subscribe' => $this->boolean('newsletter_subscribe', $this->boolean('newsletterSubscribe')),
            'passengers' => collect($this->input('passengers', []))
                ->map(fn (mixed $passenger): mixed => is_array($passenger) ? [
                    'name' => $passenger['name'] ?? null,
                    'birth_date' => $passenger['birth_date'] ?? $passenger['birthDate'] ?? null,
                    'address' => $passenger['address'] ?? null,
                    'document_number' => $passenger['document_number'] ?? $passenger['documentNumber'] ?? null,
                ] : $passenger)
                ->all(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'arrival' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'departure' => ['required', 'date_format:Y-m-d', 'after:arrival'],
            'apartment_type' => ['nullable', 'string', 'max:100'],
            'passengers' => ['required', 'array', 'min:1', 'max:'.self::MAX_GUESTS],
            'passengers.*.name' => ['required', 'string', 'max:255'],
            'passengers.*.birth_date' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'passengers.*.address' => ['nullable', 'string', 'max:255'],
            'passengers.*.document_number' => ['nullable', 'string', 'max:50'],
            'travel_insurance' => ['boolean'],
            'cancellation_insurance' => ['boolean'],
            'message' => ['nullable', 'string', 'max:5000'],
            'terms_accepted' => ['accepted'],
            'newsletter_subscribe' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'customer_name' => 'megrendelő neve',
            'email' => 'e-mail cím',
            'arrival' => 'érkezés',
            'departure' => 'távozás',
            'apartment_type' => 'apartmantípus',
            'passengers' => 'utasok',
            'passengers.*.name' => 'utas neve',
            'passengers.*.birth_date' => 'utas születési dátuma',
            'terms_accepted' => 'feltételek elfogadása',
        ];
    }
}
