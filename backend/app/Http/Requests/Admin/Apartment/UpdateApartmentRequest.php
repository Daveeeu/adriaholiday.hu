<?php

namespace App\Http\Requests\Admin\Apartment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateApartmentRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->input('name', $this->input('title')),
            'region_id' => $this->input('region_id', $this->input('regionId')),
            'location_id' => $this->input('location_id', $this->input('locationId')),
            'gallery_id' => $this->input('gallery_id', $this->input('galleryId')),
            'seo_name' => $this->input('seo_name', $this->input('seoName')),
            'seo_auto_generate' => $this->boolean('seo_auto_generate', $this->boolean('seoAutoGenerate', false)),
            'is_active' => $this->boolean('is_active', $this->boolean('isActive', true)),
            'is_accommodation' => $this->boolean('is_accommodation', $this->boolean('isAccommodation', false)),
            'sort_order' => $this->input('sort_order', $this->input('sortOrder', 0)),
            'max_guests' => $this->input('max_guests', $this->input('maxGuests', 0)),
            'size_m2' => $this->input('size_m2', $this->input('sizeM2', 0)),
            'map_address' => $this->input('map_address', $this->input('mapAddress')),
            'short_description' => $this->input('short_description', $this->input('shortDescription')),
            'additional_information' => $this->input('additional_information', $this->input('additionalInformation')),
            'apartment_type_content' => $this->input('apartment_type_content', $this->input('apartmentTypeContent')),
            'apartment_type_description' => $this->input('apartment_type_description', $this->input('apartmentTypeDescription')),
            'apartment_type_text_description' => $this->input('apartment_type_text_description', $this->input('apartmentTypeTextDescription')),
            'apartment_type_text_description_2' => $this->input('apartment_type_text_description_2', $this->input('apartmentTypeTextDescription2')),
            'all_inclusive_description' => $this->input('all_inclusive_description', $this->input('allInclusiveDescription')),
            'price_header' => $this->input('price_header', $this->input('priceHeader')),
            'price_inner_header' => $this->input('price_inner_header', $this->input('priceInnerHeader')),
            'price_seasons' => collect($this->input('price_seasons', $this->input('priceSeasons', [])))->map(function (array $season): array {
                return [
                    'id' => $season['id'] ?? null,
                    'apartment_id' => $season['apartment_id'] ?? $season['apartmentId'] ?? null,
                    'start_date' => $season['start_date'] ?? $season['startDate'] ?? null,
                    'end_date' => $season['end_date'] ?? $season['endDate'] ?? null,
                    'category' => $season['category'] ?? '',
                    'beds' => $season['beds'] ?? '',
                    'price' => $season['price'] ?? null,
                ];
            })->all(),
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
        $apartmentId = $this->route('apartment')?->id ?? $this->route('apartment');

        return [
            'name' => ['required', 'string', 'max:255'],
            'region_id' => ['required', 'integer', 'exists:regions,id'],
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'gallery_id' => ['required', 'integer', 'exists:galleries,id'],
            'type' => ['required', 'string', Rule::in(['greek', 'bulgarian', 'montenegro', 'croatian', 'croatian_new'])],
            'slug' => ['required', 'string', 'max:255', Rule::unique('apartments', 'slug')->ignore($apartmentId)],
            'code' => ['nullable', 'string', 'max:255', Rule::unique('apartments', 'code')->ignore($apartmentId)],
            'seo_name' => ['nullable', 'string', 'max:255'],
            'seo_auto_generate' => ['boolean'],
            'is_active' => ['boolean'],
            'featured' => ['boolean'],
            'is_accommodation' => ['boolean'],
            'stars' => ['required', 'integer', 'min:0', 'max:5'],
            'bedrooms' => ['required', 'integer', 'min:0'],
            'bathrooms' => ['required', 'integer', 'min:0'],
            'max_guests' => ['required', 'integer', 'min:0'],
            'size_m2' => ['required', 'numeric', 'min:0'],
            'address' => ['required', 'string'],
            'map_address' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'coordinates' => ['nullable', 'string'],
            'short_description' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'additional_information' => ['nullable', 'string'],
            'apartment_type_content' => ['nullable', 'string'],
            'apartment_type_description' => ['nullable', 'string'],
            'apartment_type_text_description' => ['nullable', 'string'],
            'apartment_type_text_description_2' => ['nullable', 'string'],
            'all_inclusive_description' => ['nullable', 'string'],
            'price_header' => ['nullable', 'string'],
            'price_inner_header' => ['nullable', 'string'],
            'pricing_matrix' => ['nullable', 'array'],
            'price_seasons' => ['nullable', 'array'],
            'price_seasons.*.id' => ['nullable', 'string'],
            'price_seasons.*.apartment_id' => ['nullable', 'integer'],
            'price_seasons.*.start_date' => ['nullable', 'date'],
            'price_seasons.*.end_date' => ['nullable', 'date', 'after_or_equal:price_seasons.*.start_date'],
            'price_seasons.*.category' => ['nullable', 'string', 'max:255'],
            'price_seasons.*.beds' => ['nullable', 'string', 'max:255'],
            'price_seasons.*.price' => ['nullable', 'numeric'],
            'amenities' => ['nullable', 'array'],
            'services' => ['nullable', 'array'],
            'status' => ['required', 'string', Rule::in(['draft', 'published', 'archived'])],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
