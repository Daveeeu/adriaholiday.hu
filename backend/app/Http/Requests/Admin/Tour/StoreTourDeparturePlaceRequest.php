<?php

namespace App\Http\Requests\Admin\Tour;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTourDeparturePlaceRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'active' => $this->boolean('active', true),
            'name' => is_string($this->input('name')) ? trim($this->input('name')) : $this->input('name'),
            'fee' => $this->input('fee'),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'active' => ['boolean'],
            // One place is one town: no routes ("Miskolc-Mezőkövesd-…") or lists ("mezőkövesdi, gyöngyösi …").
            'name' => [
                'required',
                'string',
                'max:255',
                'not_regex:/[,;\/]|\p{L}\s*-\s*\p{L}/u',
                Rule::unique('tour_departure_places', 'name')->whereNull('deleted_at')->ignore($this->placeId()),
            ],
            'city' => ['nullable', 'string', 'max:255'],
            'fee' => ['nullable', 'numeric'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.not_regex' => 'Egy felszállási helyhez csak egy település tartozhat (pl. Miskolc).',
            'name.unique' => 'Ez a felszállási hely már létezik.',
        ];
    }

    protected function placeId(): ?int
    {
        return null;
    }
}
