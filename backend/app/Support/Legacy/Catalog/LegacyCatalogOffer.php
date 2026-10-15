<?php

namespace App\Support\Legacy\Catalog;

use App\Support\Legacy\LegacyHtmlContent;

/**
 * One legacy offer mapped to the new site's fields (see
 * LegacyCatalogOfferMapper). References that need the database (travel mode,
 * departure places, categories, countries, media) are still legacy values;
 * the importer resolves them.
 *
 * @phpstan-type CatalogExtra array{legacy_id: int|null, name: string, price: float, currency: string, price_unit: string, charge_rule: string, sort_order: int}
 * @phpstan-type CatalogPlace array{legacy_id: int, name: string, fee: float}
 * @phpstan-type CatalogDate array{legacy_id: int, start_date: string, end_date: string, price: float|null, price_box_price: float|null, price_box_original_price: float|null, price_box_displayed_price: null, price_box_discount_badge: string|null, price_box_label: string|null, price_box_available_seats: int|null, status: string, accommodation: string|null, accommodation_info: string|null, catering: string|null, catering_info: string|null, legacy_attributes: array<string, mixed>, extras: array<int, CatalogExtra>, departure_places: array<int, CatalogPlace>}
 * @phpstan-type CatalogImage array{legacy_image_id: int, url: string, sort_order: int, title: string|null}
 */
final readonly class LegacyCatalogOffer
{
    /**
     * @param  array<string, mixed>  $attributes  tour columns
     * @param  array<string, string|null>  $html  rich text tour columns, as the legacy admin stores them
     * @param  array<string, mixed>  $legacyAttributes
     * @param  array<int, CatalogDate>  $dates  in start date order
     * @param  array<int, CatalogPlace>  $departurePlaces  every place of the offer's dates
     * @param  array<string, array<int, CatalogImage>>  $galleries  keyed by TourGalleryItem collection
     * @param  array{offer_groups: array<int, string>, regions: array<int, string>, region_groups: array<int, string>}  $taxonomy
     * @param  array<int, array{legacy_id: int, sort_order: int, label: string, value: string}>  $partnerBonuses
     * @param  array<int, string>  $notes  mapping decisions worth a look
     */
    public function __construct(
        public int $legacyId,
        public string $slug,
        public string $name,
        public bool $active,
        public ?string $travelMode,
        public array $attributes,
        public array $html,
        public array $legacyAttributes,
        public array $dates,
        public array $departurePlaces,
        public array $galleries,
        public ?string $sliderImageUrl,
        public ?string $programPdfUrl,
        public array $taxonomy,
        public array $partnerBonuses,
        public array $notes,
    ) {}

    /**
     * Every legacy file the offer shows (gallery images, slider image, PDF,
     * images in its texts), which the media mirror copies to our storage.
     *
     * @return array<int, string>
     */
    public function mediaUrls(string $legacyBaseUrl): array
    {
        return collect($this->galleries)
            ->flatten(1)
            ->pluck('url')
            ->push($this->sliderImageUrl, $this->programPdfUrl)
            ->merge(collect($this->html)->flatMap(fn (?string $html): array => LegacyHtmlContent::imageUrls($html, $legacyBaseUrl)))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }
}
