<?php

namespace App\Services\Legacy\Catalog;

use App\Support\Legacy\Catalog\LegacyCatalog;
use Illuminate\Support\Facades\Validator;

/**
 * Checks the structure of the legacy catalog before anything is imported:
 * errors keep an offer out of the import, warnings only need a look.
 */
final class LegacyCatalogValidator
{
    /** Extra types the legacy admin offers. */
    private const EXTRA_TYPES = ['Választható', 'Egyágyas', 'Előre kiválasztott', 'Előre kiválasztott, kötelező'];

    private const EXTRA_UNITS = ['Ft', 'Ft/fő', 'EUR', 'EUR/fő'];

    /**
     * Problems of the file as a whole.
     *
     * @return array<int, string>
     */
    public function catalogErrors(LegacyCatalog $catalog): array
    {
        $errors = [];

        if ($catalog->declaredCount !== null && $catalog->declaredCount !== count($catalog->offers)) {
            $errors[] = sprintf('The file declares %d offers but lists %d.', $catalog->declaredCount, count($catalog->offers));
        }

        if ($catalog->boardingPoints() === []) {
            $errors[] = 'The reference data lists no boarding points.';
        }

        foreach (['legacy_id' => fn (array $offer): mixed => $offer['legacy_id'] ?? null, 'slug' => fn (array $offer): mixed => $offer['slug'] ?? null] as $key => $value) {
            $duplicates = collect($catalog->offers)->filter(fn (mixed $offer): bool => is_array($offer))->map($value)->filter()->duplicates()->unique();

            if ($duplicates->isNotEmpty()) {
                $errors[] = sprintf('Duplicate offer %s: %s.', $key, $duplicates->implode(', '));
            }
        }

        $dateIds = collect($catalog->offers)->flatMap(fn (mixed $offer): array => is_array($offer) ? array_column($offer['departures'] ?? [], 'legacy_date_id') : []);

        if ($dateIds->duplicates()->isNotEmpty()) {
            $errors[] = 'Duplicate departure legacy_date_id: '.$dateIds->duplicates()->unique()->implode(', ').'.';
        }

        return $errors;
    }

    /**
     * @param  array<int, array<string, mixed>>  $boardingPoints  keyed by legacy id
     * @return array{errors: array<int, string>, warnings: array<int, string>}
     */
    public function offerIssues(mixed $offer, array $boardingPoints): array
    {
        if (! is_array($offer)) {
            return ['errors' => ['The offer is not an object.'], 'warnings' => []];
        }

        $validator = Validator::make($offer, $this->rules());
        $errors = array_values($validator->errors()->all());
        $warnings = [];

        foreach ($offer['departures'] ?? [] as $index => $departure) {
            if (! is_array($departure)) {
                continue;
            }

            $label = sprintf('Departure %s (%s)', $departure['legacy_date_id'] ?? $index, $departure['start_date'] ?? '?');
            $price = $departure['price'] ?? null;
            $salePrice = $departure['sale_price'] ?? null;

            if (is_numeric($price) && (float) $price <= 0) {
                $warnings[] = "{$label}: no price.";
            }

            if (is_numeric($salePrice) && (float) $salePrice > 0 && is_numeric($price) && (float) $salePrice >= (float) $price) {
                $warnings[] = "{$label}: the sale price {$salePrice} is not below the price {$price}; the price is used.";
            }

            foreach ($departure['boarding_points'] ?? [] as $point) {
                if (is_array($point) && ! isset($boardingPoints[(int) ($point['legacy_id'] ?? 0)])) {
                    $warnings[] = sprintf('%s: boarding point %s is missing from the reference list.', $label, $point['legacy_id'] ?? '?');
                }
            }

            foreach ($departure['extra_prices'] ?? [] as $extra) {
                if (is_array($extra) && ! in_array(trim((string) ($extra['type'] ?? '')), self::EXTRA_TYPES, true)) {
                    $warnings[] = sprintf('%s: extra "%s" has the unknown type "%s"; it is optional.', $label, $extra['name'] ?? '?', $extra['type'] ?? '');
                }
            }
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        $optionalText = ['nullable', 'string'];

        return [
            'legacy_id' => ['required', 'integer', 'min:1'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'subtitle_1' => ['nullable', 'string', 'max:255'],
            'subtitle_2' => ['nullable', 'string', 'max:255'],
            'featured_subtitle' => ['nullable', 'string', 'max:255'],
            'active' => ['required', 'boolean'],
            'featured' => ['required', 'boolean'],
            'featured_position' => ['nullable', 'integer', 'min:0'],
            'coupon_enabled' => ['required', 'boolean'],
            'image_offer' => ['required', 'boolean'],
            'xml_enabled' => ['required', 'boolean'],
            'listed_in_admin_offer_list' => ['nullable', 'boolean'],
            'listed_in_partner_offer_list' => ['nullable', 'boolean'],
            'description_html' => $optionalText,
            'cities_html' => $optionalText,
            'program_html' => $optionalText,
            'program_footer_html' => $optionalText,
            'entrance_fees_html' => $optionalText,
            'optional_program_html' => $optionalText,
            'prices_html' => $optionalText,
            'intro_html' => $optionalText,
            'slider_html' => $optionalText,
            'regions' => ['present', 'array'],
            'regions.*' => ['string'],
            'region_groups' => ['present', 'array'],
            'region_groups.*' => ['string'],
            'offer_groups' => ['present', 'array'],
            'offer_groups.*' => ['string'],
            'seasonal_groups' => ['present', 'array'],
            'seasonal_groups.*' => ['string'],
            'main_gallery' => ['nullable', 'array'],
            'main_gallery.images' => ['array'],
            'main_gallery.images.*' => ['required', 'array'],
            'main_gallery.images.*.image_id' => ['required', 'integer'],
            'main_gallery.images.*.order' => ['required', 'integer'],
            'main_gallery.images.*.url' => ['required', 'url:https'],
            'program_gallery' => ['nullable', 'array'],
            'program_gallery.images.*.image_id' => ['required', 'integer'],
            'program_gallery.images.*.url' => ['required', 'url:https'],
            'intro_gallery' => ['nullable', 'array'],
            'intro_gallery.images.*.image_id' => ['required', 'integer'],
            'intro_gallery.images.*.url' => ['required', 'url:https'],
            'slider_image' => ['nullable', 'url:https'],
            'program_pdf' => ['nullable', 'url:https'],
            'departures' => ['present', 'array'],
            'departures.*.legacy_date_id' => ['required', 'integer', 'min:1'],
            'departures.*.start_date' => ['required', 'date_format:Y-m-d'],
            'departures.*.end_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:departures.*.start_date'],
            'departures.*.price' => ['required', 'numeric', 'min:0'],
            'departures.*.sale_price' => ['nullable', 'numeric', 'min:0'],
            'departures.*.currency' => ['required', 'in:HUF'],
            'departures.*.status' => ['required', 'in:active,inactive'],
            'departures.*.active' => ['required', 'boolean'],
            'departures.*.capacity_monitoring' => ['required', 'boolean'],
            'departures.*.capacity' => ['nullable', 'integer', 'min:0'],
            'departures.*.boarding_points' => ['present', 'array'],
            'departures.*.boarding_points.*.legacy_id' => ['required', 'integer'],
            'departures.*.boarding_points.*.label' => ['required', 'string'],
            'departures.*.extra_prices' => ['present', 'array'],
            'departures.*.extra_prices.*.legacy_id' => ['required', 'integer'],
            'departures.*.extra_prices.*.name' => ['required', 'string', 'max:255'],
            'departures.*.extra_prices.*.price' => ['required', 'numeric', 'min:0'],
            'departures.*.extra_prices.*.unit' => ['required', 'in:'.implode(',', self::EXTRA_UNITS)],
            'departures.*.extra_prices.*.type' => ['present', 'nullable', 'string'],
            'departures.*.fields' => ['required', 'array'],
            'departures.*.fields.travel' => ['present', 'nullable', 'array'],
            'partner_bonuses' => ['present', 'array'],
            'partner_bonuses.*.legacy_id' => ['required', 'integer'],
            'partner_bonuses.*.min' => ['required', 'integer', 'min:0'],
            'partner_bonuses.*.max' => ['required', 'integer', 'min:0'],
            'partner_bonuses.*.free_places' => ['required', 'integer', 'min:0'],
            'extra_fields' => ['present', 'array'],
        ];
    }
}
