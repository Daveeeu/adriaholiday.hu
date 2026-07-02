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
            'homepage_offer_id' => $this->input('homepage_offer_id', $this->input('homepageOfferId')),
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
            'gallery_title' => $this->input('gallery_title', $this->input('galleryTitle')),
            'gallery_subtitle' => $this->input('gallery_subtitle', $this->input('gallerySubtitle')),
            'gallery' => collect($this->input('gallery', $this->input('galleryItems', [])))->map(function (array $item, int $index): array {
                return [
                    'id' => $item['id'] ?? $item['clientId'] ?? null,
                    'media_id' => $item['media_id'] ?? $item['mediaId'] ?? null,
                    'title' => $item['title'] ?? null,
                    'alt' => $item['alt'] ?? null,
                    'caption' => $item['caption'] ?? null,
                    'sort_order' => $item['sort_order'] ?? $item['sortOrder'] ?? ($index + 1),
                    'active' => filter_var($item['active'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true,
                ];
            })->all(),
            'price_box_price' => $this->input('price_box_price', $this->input('priceBox.price')),
            'price_box_displayed_price' => $this->input('price_box_displayed_price', $this->input('priceBox.displayedPrice')),
            'price_box_currency' => $this->input('price_box_currency', $this->input('priceBox.currency')),
            'price_box_price_suffix' => $this->input('price_box_price_suffix', $this->input('priceBox.priceSuffix')),
            'price_box_discount_badge' => $this->input('price_box_discount_badge', $this->input('priceBox.discountBadge')),
            'price_box_discount_text' => $this->input('price_box_discount_text', $this->input('priceBox.discountText')),
            'price_box_urgency_text' => $this->input('price_box_urgency_text', $this->input('priceBox.urgencyText')),
            'price_box_rating_text' => $this->input('price_box_rating_text', $this->input('priceBox.ratingText')),
            'price_box_min_participants' => $this->input('price_box_min_participants', $this->input('priceBox.minParticipants')),
            'price_box_max_participants' => $this->input('price_box_max_participants', $this->input('priceBox.maxParticipants')),
            'price_box_available_seats' => $this->input('price_box_available_seats', $this->input('priceBox.availableSeats')),
            'price_box_capacity' => $this->input('price_box_capacity', $this->input('priceBox.capacity')),
            'price_box_cta_primary_label' => $this->input('price_box_cta_primary_label', $this->input('priceBox.ctaPrimaryLabel')),
            'price_box_cta_secondary_label' => $this->input('price_box_cta_secondary_label', $this->input('priceBox.ctaSecondaryLabel')),
            'program_days' => collect($this->input('program_days', $this->input('programDays', [])))->map(function (array $day, int $index): array {
                $badges = collect($day['badges'] ?? [])
                    ->map(function ($badge): string {
                        if (is_array($badge)) {
                            return trim((string) ($badge['text'] ?? $badge['value'] ?? ''));
                        }

                        return trim((string) $badge);
                    })
                    ->filter()
                    ->values()
                    ->all();

                return [
                    'id' => $day['id'] ?? $day['clientId'] ?? null,
                    'sort_order' => $day['sort_order'] ?? $day['sortOrder'] ?? ($index + 1),
                    'day_number' => $day['day_number'] ?? $day['dayNumber'] ?? ($index + 1),
                    'title' => $day['title'] ?? '',
                    'description' => $day['description'] ?? '',
                    'image' => $day['image'] ?? null,
                    'icon' => $day['icon'] ?? null,
                    'experience_type' => $day['experience_type'] ?? $day['experienceType'] ?? null,
                    'badges' => $badges,
                    'active' => filter_var($day['active'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true,
                ];
            })->all(),
            'price' => $this->input('price'),
            'displayed_price' => $this->input('displayed_price', $this->input('displayedPrice')),
            'slider_text' => $this->input('slider_text', $this->input('sliderText')),
            'price_items' => collect($this->input('price_items', $this->input('priceItems', [])))->map(function (array $item, int $index): array {
                return [
                    'id' => $item['id'] ?? $item['clientId'] ?? null,
                    'type' => $item['type'] ?? 'included',
                    'text' => $item['text'] ?? '',
                    'sort_order' => $item['sort_order'] ?? $item['sortOrder'] ?? ($index + 1),
                    'active' => filter_var($item['active'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true,
                ];
            })->all(),
            'departure_place_ids' => $this->input('departure_place_ids', $this->input('departurePlaceIds', [])),
            'country_ids' => $this->input('country_ids', $this->input('countryIds', [])),
            'tag_ids' => $this->input('tag_ids', $this->input('tagIds', [])),
            'category_ids' => $this->input('category_ids', $this->input('categoryIds', [])),
            'dates' => collect($this->input('dates', []))->map(function (array $date): array {
                $priceBox = $date['priceBox'] ?? [];

                return [
                    'start_date' => $date['start_date'] ?? $date['startDate'] ?? null,
                    'end_date' => $date['end_date'] ?? $date['endDate'] ?? null,
                    'price' => $date['price'] ?? $priceBox['price'] ?? null,
                    'price_box_price' => $date['price_box_price'] ?? $priceBox['price'] ?? null,
                    'price_box_displayed_price' => $date['price_box_displayed_price'] ?? $priceBox['displayedPrice'] ?? null,
                    'price_box_discount_badge' => $date['price_box_discount_badge'] ?? $priceBox['discountBadge'] ?? null,
                    'price_box_min_participants' => $date['price_box_min_participants'] ?? $priceBox['minParticipants'] ?? null,
                    'price_box_max_participants' => $date['price_box_max_participants'] ?? $priceBox['maxParticipants'] ?? null,
                    'price_box_available_seats' => $date['price_box_available_seats'] ?? $priceBox['availableSeats'] ?? null,
                    'price_box_capacity' => $date['price_box_capacity'] ?? $priceBox['capacity'] ?? null,
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
            'gallery_title' => ['nullable', 'string', 'max:255'],
            'gallery_subtitle' => ['nullable', 'string', 'max:255'],
            'gallery' => ['nullable', 'array'],
            'gallery.*.id' => ['nullable', 'string', 'max:255'],
            'gallery.*.media_id' => ['required_with:gallery', 'integer', 'exists:media,id'],
            'gallery.*.title' => ['nullable', 'string', 'max:255'],
            'gallery.*.alt' => ['nullable', 'string', 'max:255'],
            'gallery.*.caption' => ['nullable', 'string', 'max:255'],
            'gallery.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'gallery.*.active' => ['nullable', 'boolean'],
            'price_box_price' => ['nullable', 'numeric'],
            'price_box_displayed_price' => ['nullable', 'string', 'max:255'],
            'price_box_currency' => ['nullable', 'string', 'max:8'],
            'price_box_price_suffix' => ['nullable', 'string', 'max:32'],
            'price_box_discount_badge' => ['nullable', 'string', 'max:32'],
            'price_box_discount_text' => ['nullable', 'string', 'max:255'],
            'price_box_urgency_text' => ['nullable', 'string', 'max:255'],
            'price_box_rating_text' => ['nullable', 'string', 'max:255'],
            'price_box_min_participants' => ['nullable', 'integer', 'min:0'],
            'price_box_max_participants' => ['nullable', 'integer', 'min:0'],
            'price_box_available_seats' => ['nullable', 'integer', 'min:0'],
            'price_box_capacity' => ['nullable', 'integer', 'min:0'],
            'price_box_cta_primary_label' => ['nullable', 'string', 'max:255'],
            'price_box_cta_secondary_label' => ['nullable', 'string', 'max:255'],
            'program_days' => ['nullable', 'array'],
            'program_days.*.id' => ['nullable'],
            'program_days.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'program_days.*.day_number' => ['required_with:program_days', 'integer', 'min:1'],
            'program_days.*.title' => ['required_with:program_days', 'string', 'max:255'],
            'program_days.*.description' => ['nullable', 'string'],
            'program_days.*.image' => ['nullable', 'string', 'max:2048'],
            'program_days.*.icon' => ['nullable', 'string', 'max:50'],
            'program_days.*.experience_type' => ['nullable', 'string', 'max:255'],
            'program_days.*.badges' => ['nullable', 'array'],
            'program_days.*.badges.*' => ['nullable', 'string', 'max:100'],
            'program_days.*.active' => ['nullable', 'boolean'],
            'price_items' => ['nullable', 'array'],
            'price_items.*.id' => ['nullable', 'string', 'max:255'],
            'price_items.*.type' => ['required_with:price_items', 'string', Rule::in(['included', 'excluded'])],
            'price_items.*.text' => ['required_with:price_items', 'string', 'max:2000'],
            'price_items.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'price_items.*.active' => ['nullable', 'boolean'],
            'region_id' => ['nullable', 'integer', 'exists:regions,id'],
            'homepage_offer_id' => ['nullable', 'integer', 'exists:homepage_offers,id'],
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
            'dates.*.price_box_price' => ['nullable', 'numeric'],
            'dates.*.price_box_displayed_price' => ['nullable', 'string', 'max:255'],
            'dates.*.price_box_discount_badge' => ['nullable', 'string', 'max:32'],
            'dates.*.price_box_min_participants' => ['nullable', 'integer', 'min:0'],
            'dates.*.price_box_max_participants' => ['nullable', 'integer', 'min:0'],
            'dates.*.price_box_available_seats' => ['nullable', 'integer', 'min:0'],
            'dates.*.price_box_capacity' => ['nullable', 'integer', 'min:0'],
            'dates.*.status' => ['nullable', 'string', Rule::in(['planned', 'available', 'sold_out', 'cancelled'])],
            'partner_bonuses' => ['nullable', 'array'],
            'partner_bonuses.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'partner_bonuses.*.label' => ['required_with:partner_bonuses', 'string', 'max:255'],
            'partner_bonuses.*.value' => ['nullable', 'string', 'max:255'],
        ];
    }
}
