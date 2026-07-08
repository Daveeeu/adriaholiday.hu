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
                Rule::exists('tour_dates', 'id')
                    ->where('tour_id', $this->input('tour_id'))
                    ->whereIn('status', ['planned', 'available']),
            ],
            'participants' => ['nullable', 'integer', 'min:1', 'max:20'],
            'form_data' => ['nullable', 'array', 'max:30'],
            'form_data.*' => ['nullable', 'string', 'max:500'],
            'passengers' => ['nullable', 'array', 'max:20'],
            'passengers.*' => ['array', 'max:30'],
            'passengers.*.*' => ['nullable', 'string', 'max:500'],
            'note' => ['nullable', 'string', 'max:2000'],
            'type' => ['nullable', 'string', Rule::in(['tour_booking', 'tour_inquiry'])],
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
        ];
    }
}
