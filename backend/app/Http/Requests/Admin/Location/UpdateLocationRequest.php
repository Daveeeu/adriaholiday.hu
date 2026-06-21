<?php

namespace App\Http\Requests\Admin\Location;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLocationRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'region_id' => $this->input('region_id', $this->input('regionId')),
            'transfer_minutes_from_airport' => $this->input('transfer_minutes_from_airport', $this->input('transferMinutesFromAirport', 0)),
            'featured' => $this->boolean('featured', false),
            'is_active' => $this->boolean('is_active', $this->boolean('isActive', true)),
            'sort_order' => $this->input('sort_order', $this->input('sortOrder', 0)),
        ]);
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $locationId = $this->route('location')?->id ?? $this->route('location');

        return [
            'region_id' => ['required', 'integer', 'exists:regions,id'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('locations', 'slug')->ignore($locationId)],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::in(['city', 'island', 'coastal_town', 'national_park'])],
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'transfer_minutes_from_airport' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'featured' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
