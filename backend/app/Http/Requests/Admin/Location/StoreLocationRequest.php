<?php

namespace App\Http\Requests\Admin\Location;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLocationRequest extends FormRequest
{
    /**
     * The fields of a location's apartment page (camelCase in the admin's
     * payload), only replaced when the form sends them.
     */
    private const APARTMENT_PAGE_FIELDS = [
        'area_slug' => 'areaSlug',
        'area_name' => 'areaName',
        'guide' => 'guide',
        'apartment_information' => 'apartmentInformation',
        'seo_title' => 'seoTitle',
        'seo_description' => 'seoDescription',
        'seo_robots' => 'seoRobots',
    ];

    protected function prepareForValidation(): void
    {
        $this->merge([
            'region_id' => $this->input('region_id', $this->input('regionId')),
            'transfer_minutes_from_airport' => $this->input('transfer_minutes_from_airport', $this->input('transferMinutesFromAirport', 0)),
            'featured' => $this->boolean('featured'),
            'is_active' => $this->boolean('is_active', $this->boolean('isActive', true)),
            'sort_order' => $this->input('sort_order', $this->input('sortOrder', 0)),
        ]);

        foreach (self::APARTMENT_PAGE_FIELDS as $field => $camelField) {
            if (! $this->has($field) && $this->has($camelField)) {
                $this->merge([$field => $this->input($camelField)]);
            }
        }
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
        return [
            'region_id' => ['required', 'integer', 'exists:regions,id'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('locations', 'slug')->ignore($this->locationId())],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::in(['city', 'island', 'coastal_town', 'national_park'])],
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'transfer_minutes_from_airport' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'featured' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            // The apartment page lives at /apartmanok/{area_slug}/{slug}.
            'area_slug' => ['nullable', 'string', 'max:100', 'regex:/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/'],
            'area_name' => ['nullable', 'string', 'max:255'],
            'guide' => ['nullable', 'string'],
            'apartment_information' => ['nullable', 'string'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'seo_robots' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * The location being edited (none when one is created).
     */
    protected function locationId(): ?int
    {
        return null;
    }
}
