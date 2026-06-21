<?php

namespace App\Http\Requests\Admin\Tour;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTourRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'region_id' => $this->input('region_id', $this->input('regionId')),
            'group_id' => $this->input('group_id', $this->input('groupId')),
            'seasonal_group_id' => $this->input('seasonal_group_id', $this->input('seasonalGroupId')),
            'fit_id' => $this->input('fit_id', $this->input('fitId')),
            'program_type_id' => $this->input('program_type_id', $this->input('programTypeId')),
            'travel_mode_id' => $this->input('travel_mode_id', $this->input('travelModeId')),
            'difficulty_id' => $this->input('difficulty_id', $this->input('difficultyId')),
            'sort_order' => $this->input('sort_order', $this->input('sortOrder', 0)),
            'active' => $this->boolean('active', true),
            'featured' => $this->boolean('featured', false),
            'recommended' => $this->boolean('recommended', false),
            'partner_offer' => $this->boolean('partner_offer', $this->boolean('partnerOffer', false)),
            'image_offer' => $this->boolean('image_offer', $this->boolean('imageOffer', false)),
            'xml_enabled' => $this->boolean('xml_enabled', $this->boolean('xmlEnabled', false)),
            'slider_image_enabled' => $this->boolean('slider_image_enabled', $this->boolean('sliderImageEnabled', false)),
            'slider_text_enabled' => $this->boolean('slider_text_enabled', $this->boolean('sliderTextEnabled', false)),
            'seo_auto_generate' => $this->boolean('seo_auto_generate', $this->boolean('seoAutoGenerate', false)),
            'seo_name' => $this->input('seo_name', $this->input('seoName')),
            'action1' => $this->input('action1', $this->input('actionOne', $this->input('action1Text'))),
            'action2' => $this->input('action2', $this->input('actionTwo', $this->input('action2Text'))),
            'list_description' => $this->input('list_description', $this->input('listDescription')),
            'short_description' => $this->input('short_description', $this->input('shortDescription')),
            'program_pdf_path' => $this->input('program_pdf_path', $this->input('programPdfPath', $this->input('programPdf'))),
            'program_pdf_file' => $this->input('program_pdf_file', $this->input('programPdfFile')),
            'slider_image' => $this->input('slider_image', $this->input('sliderImage')),
            'program_before' => $this->input('program_before', $this->input('programBefore')),
            'inclusions' => $this->input('inclusions'),
            'payment_program' => $this->input('payment_program', $this->input('paymentProgram')),
            'prices' => $this->input('prices'),
            'discounts' => $this->input('discounts'),
            'notes' => $this->input('notes'),
            'price' => $this->input('price'),
            'displayed_price' => $this->input('displayed_price', $this->input('displayedPrice')),
            'slider_text' => $this->input('slider_text', $this->input('sliderText')),
            'departure_place_ids' => $this->input('departure_place_ids', $this->input('departurePlaceIds', [])),
            'country_ids' => $this->input('country_ids', $this->input('countryIds', [])),
            'tag_ids' => $this->input('tag_ids', $this->input('tagIds', [])),
            'category_ids' => $this->input('category_ids', $this->input('categoryIds', [])),
            'dates' => collect($this->input('dates', []))->map(function (array $date): array {
                return [
                    'start_date' => $date['start_date'] ?? $date['startDate'] ?? null,
                    'end_date' => $date['end_date'] ?? $date['endDate'] ?? null,
                    'price' => $date['price'] ?? null,
                    'status' => $date['status'] ?? 'planned',
                ];
            })->all(),
            'partner_bonuses' => collect($this->input('partner_bonuses', $this->input('partnerBonuses', [])))->map(function (array $bonus, int $index): array {
                return [
                    'sort_order' => $bonus['sort_order'] ?? $bonus['sortOrder'] ?? ($index + 1),
                    'label' => $bonus['label'] ?? '',
                    'value' => $bonus['value'] ?? null,
                ];
            })->all(),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tourId = $this->route('tour')?->id ?? $this->route('tour');

        return [
            'sort_order' => ['integer', 'min:0'],
            'active' => ['boolean'],
            'featured' => ['boolean'],
            'recommended' => ['boolean'],
            'partner_offer' => ['boolean'],
            'image_offer' => ['boolean'],
            'xml_enabled' => ['boolean'],
            'slider_image_enabled' => ['boolean'],
            'slider_text_enabled' => ['boolean'],
            'name' => ['required', 'string', 'max:255'],
            'seo_name' => ['nullable', 'string', 'max:255', Rule::unique('tours', 'seo_name')->ignore($tourId)],
            'seo_auto_generate' => ['boolean'],
            'action1' => ['nullable', 'string', 'max:255'],
            'action2' => ['nullable', 'string', 'max:255'],
            'list_description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string'],
            'program_pdf_path' => ['nullable', 'string', 'max:2048'],
            'program_pdf_file' => ['nullable', 'string', 'max:255'],
            'slider_image' => ['nullable', 'string', 'max:2048'],
            'program_before' => ['nullable', 'string'],
            'program' => ['nullable', 'string'],
            'inclusions' => ['nullable', 'string'],
            'payment_program' => ['nullable', 'string'],
            'prices' => ['nullable', 'string'],
            'discounts' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'region_id' => ['nullable', 'integer', 'exists:regions,id'],
            'group_id' => ['nullable', 'string', 'max:255'],
            'seasonal_group_id' => ['nullable', 'string', 'max:255'],
            'fit_id' => ['nullable', 'string', 'max:255'],
            'program_type_id' => ['nullable', 'string', 'max:255'],
            'travel_mode_id' => ['nullable', 'string', 'max:255'],
            'difficulty_id' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'numeric'],
            'displayed_price' => ['nullable', 'string', 'max:255'],
            'slider_text' => ['nullable', 'string'],
            'departure_place_ids' => ['nullable', 'array'],
            'departure_place_ids.*' => ['integer', 'exists:tour_departure_places,id'],
            'country_ids' => ['nullable', 'array'],
            'country_ids.*' => ['nullable', 'string', 'max:255'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['nullable', 'string', 'max:255'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['nullable', 'string', 'max:255'],
            'dates' => ['nullable', 'array'],
            'dates.*.start_date' => ['nullable', 'date'],
            'dates.*.end_date' => ['nullable', 'date', 'after_or_equal:dates.*.start_date'],
            'dates.*.price' => ['nullable', 'numeric'],
            'dates.*.status' => ['nullable', 'string', Rule::in(['planned', 'available', 'sold_out', 'cancelled'])],
            'partner_bonuses' => ['nullable', 'array'],
            'partner_bonuses.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'partner_bonuses.*.label' => ['required_with:partner_bonuses', 'string', 'max:255'],
            'partner_bonuses.*.value' => ['nullable', 'string', 'max:255'],
        ];
    }
}
