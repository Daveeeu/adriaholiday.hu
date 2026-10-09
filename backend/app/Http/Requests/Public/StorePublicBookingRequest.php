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
            'coupon_code' => $this->input('coupon_code', $this->input('couponCode')),
            'departure_place_id' => $this->input('departure_place_id', $this->input('departurePlaceId')),
            'extra_ids' => $this->input('extra_ids', $this->input('extraIds', [])),
            'extra_choices' => $this->input('extra_choices', $this->input('extraChoices', [])),
            'travel_insurance' => $this->boolean('travel_insurance', $this->boolean('travelInsurance')),
            'cancellation_insurance' => $this->boolean('cancellation_insurance', $this->boolean('cancellationInsurance')),
            'passenger_options' => $this->passengerOptions(),
            'type' => $this->input('type', 'tour_booking'),
            'terms_accepted' => $this->boolean('terms_accepted', $this->boolean('termsAccepted')),
        ]);
    }

    /**
     * Each passenger's extras and insurances (passengerOptions), snake_cased;
     * null when the form sends none.
     *
     * @return array<int, mixed>|null
     */
    private function passengerOptions(): ?array
    {
        $options = $this->input('passenger_options', $this->input('passengerOptions'));

        if (! is_array($options)) {
            return null;
        }

        return array_map(fn (mixed $passenger): mixed => is_array($passenger) ? [
            'extra_ids' => $passenger['extra_ids'] ?? $passenger['extraIds'] ?? [],
            'extra_choices' => $passenger['extra_choices'] ?? $passenger['extraChoices'] ?? [],
            'travel_insurance' => filter_var($passenger['travel_insurance'] ?? $passenger['travelInsurance'] ?? false, FILTER_VALIDATE_BOOL),
            'cancellation_insurance' => filter_var($passenger['cancellation_insurance'] ?? $passenger['cancellationInsurance'] ?? false, FILTER_VALIDATE_BOOL),
        ] : $passenger, array_values($options));
    }

    /**
     * The validator rebuilds nested lists in rule order, so a passenger
     * without values can end up out of place; passengers and their options
     * are matched by position, so both lists keep the submitted order.
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();

        foreach (['passengers', 'passenger_options'] as $list) {
            if (is_array($validated[$list] ?? null)) {
                ksort($validated[$list]);
                $validated[$list] = array_values($validated[$list]);
            }
        }

        return data_get($validated, $key, $default);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tour_id' => [
                'required',
                'integer',
                Rule::exists('tours', 'id')
                    ->where('active', true)
                    ->whereNull('deleted_at'),
            ],
            'tour_date_id' => [
                'nullable',
                'integer',
                // Only an upcoming date that is still on sale can be booked.
                Rule::exists('tour_dates', 'id')
                    ->where('tour_id', $this->input('tour_id'))
                    ->whereIn('status', ['planned', 'available'])
                    ->whereNull('deleted_at')
                    ->where(fn ($query) => $query->whereDate('start_date', '>=', today())),
            ],
            'participants' => ['nullable', 'integer', 'min:1', 'max:20'],
            'form_data' => ['nullable', 'array', 'max:30'],
            'form_data.*' => ['nullable', 'string', 'max:500'],
            'passengers' => ['nullable', 'array', 'max:20'],
            'passengers.*' => ['array', 'max:30'],
            'passengers.*.*' => ['nullable', 'string', 'max:500'],
            'note' => ['nullable', 'string', 'max:2000'],
            'coupon_code' => ['nullable', 'string', 'max:100'],
            'departure_place_id' => ['nullable', 'integer'],
            'extra_ids' => ['nullable', 'array', 'max:30'],
            'extra_ids.*' => ['integer', 'distinct'],
            'extra_choices' => ['nullable', 'array', 'max:30'],
            'extra_choices.*' => ['string', 'max:255'],
            'travel_insurance' => ['boolean'],
            'cancellation_insurance' => ['boolean'],
            'passenger_options' => ['nullable', 'array', 'max:20'],
            'passenger_options.*' => ['array'],
            'passenger_options.*.extra_ids' => ['array', 'max:30'],
            'passenger_options.*.extra_ids.*' => ['integer'],
            'passenger_options.*.extra_choices' => ['array', 'max:30'],
            'passenger_options.*.extra_choices.*' => ['string', 'max:255'],
            'passenger_options.*.travel_insurance' => ['boolean'],
            'passenger_options.*.cancellation_insurance' => ['boolean'],
            'type' => ['nullable', 'string', Rule::in(['tour_booking', 'tour_inquiry'])],
            'terms_accepted' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'tour_id.required' => 'Az utazás azonosítója kötelező.',
            'tour_id.integer' => 'Érvénytelen utazás azonosító.',
            'tour_id.exists' => 'A kiválasztott utazás nem található vagy jelenleg nem foglalható.',
            'tour_date_id.integer' => 'Érvénytelen időpont azonosító.',
            'tour_date_id.exists' => 'A kiválasztott időpont nem érhető el ehhez az utazáshoz.',
            'participants.integer' => 'A létszámnak számnak kell lennie.',
            'participants.min' => 'Legalább 1 fő részvétele szükséges.',
            'participants.max' => 'Egyszerre legfeljebb 20 fő foglalható.',
            'form_data.array' => 'Érvénytelen űrlapadat formátum.',
            'form_data.max' => 'Túl sok mező lett megadva.',
            'form_data.*.max' => 'A megadott érték túl hosszú.',
            'passengers.array' => 'Érvénytelen utaslista formátum.',
            'passengers.max' => 'Egyszerre legfeljebb 20 utas adható meg.',
            'passengers.*.max' => 'Túl sok mező lett megadva egy utasnál.',
            'passengers.*.*.max' => 'A megadott érték túl hosszú.',
            'note.max' => 'A megjegyzés túl hosszú.',
            'type.in' => 'Érvénytelen foglalástípus.',
            'departure_place_id.integer' => 'Érvénytelen felszállási hely.',
            'extra_ids.array' => 'Érvénytelen felár lista.',
            'extra_ids.max' => 'Túl sok felár lett kiválasztva.',
            'extra_ids.*.integer' => 'Érvénytelen felár azonosító.',
            'extra_ids.*.distinct' => 'Egy felár csak egyszer választható.',
            'extra_choices.array' => 'Érvénytelen felár választás.',
            'extra_choices.*.max' => 'A megadott érték túl hosszú.',
            'passenger_options.array' => 'Érvénytelen utas opciók.',
            'passenger_options.max' => 'Egyszerre legfeljebb 20 utas adható meg.',
            'passenger_options.*.extra_ids.*.integer' => 'Érvénytelen felár azonosító.',
            'passenger_options.*.extra_choices.*.max' => 'A megadott érték túl hosszú.',
            'terms_accepted.accepted' => 'Az ÁSZF és az adatkezelési tájékoztató elfogadása kötelező.',
        ];
    }
}
