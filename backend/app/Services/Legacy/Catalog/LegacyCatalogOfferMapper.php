<?php

namespace App\Services\Legacy\Catalog;

use App\Models\TourGalleryItem;
use App\Support\Legacy\Catalog\LegacyCatalogOffer;
use App\Support\Legacy\LegacyBookingOptionRules;
use App\Support\Legacy\LegacyText;
use App\Support\Tour\TourDateStatus;
use App\Support\Tour\TourExtraCurrency;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * Maps one offer of the legacy catalog export to the new site's fields,
 * without touching the database. Nothing is inferred from page layout: the
 * texts stay the blocks the legacy admin stores, and every field without a
 * place of its own goes to legacy_attributes.
 *
 * @phpstan-import-type CatalogDate from LegacyCatalogOffer
 * @phpstan-import-type CatalogExtra from LegacyCatalogOffer
 * @phpstan-import-type CatalogImage from LegacyCatalogOffer
 */
final class LegacyCatalogOfferMapper
{
    /** Rich text tour column => legacy field. */
    private const HTML_FIELDS = [
        'program' => 'program_html',
        'program_footer' => 'program_footer_html',
        'teaser' => 'intro_html',
        'tickets' => 'entrance_fees_html',
        'optional_programs' => 'optional_program_html',
        'prices' => 'prices_html',
        'list_description' => 'description_html',
    ];

    /** Date fields with no column of their own, kept in the date's legacy_attributes. */
    private const DATE_LEGACY_FIELDS = ['status', 'status_label', 'active', 'xml_enabled', 'holiday_home', 'capacity_monitoring', 'capacity', 'currency', 'price', 'sale_price', 'list_text'];

    /** The legacy admin's example texts in its empty SEO fields, never a real title or description. */
    private const SEO_PLACEHOLDERS = ['út címe', '120-160 karakeres mondat ami az út fő jellemzőit tartalmazza'];

    private const DATE_LEGACY_FORM_FIELDS = ['accommodation_cesys', 'accommodation_info_cesys', 'accommodation_email_info', 'resort_fee', 'resort_fee_eur', 'last_minute', 'price_info'];

    /**
     * @param  array<string, mixed>  $offer  one offer of the export, already validated
     */
    public function map(array $offer, CarbonInterface $today): LegacyCatalogOffer
    {
        $notes = [];
        $dates = [];

        foreach ($offer['departures'] ?? [] as $departure) {
            $dates[] = $this->date($departure, $notes);
        }

        $dates = collect($dates)->sortBy([['start_date', 'asc'], ['legacy_id', 'asc']])->values();
        $stay = $this->tourStay($dates);
        $travelModes = $dates->pluck('travel_mode')->filter();
        $price = $this->tourPrice($dates, $today);
        $extraFields = is_array($offer['extra_fields'] ?? null) ? $offer['extra_fields'] : [];

        if ($travelModes->unique()->count() > 1) {
            $notes[] = 'Dates travel differently; the tour takes the most common travel mode.';
        }

        return new LegacyCatalogOffer(
            legacyId: (int) $offer['legacy_id'],
            slug: trim((string) $offer['slug']),
            name: trim((string) $offer['name']),
            active: (bool) $offer['active'],
            travelMode: $this->mostCommon($travelModes),
            attributes: [
                'name' => trim((string) $offer['name']),
                'subtitle' => LegacyText::line(trim(($offer['subtitle_1'] ?? '').' '.($offer['subtitle_2'] ?? ''))),
                'seo_name' => trim((string) $offer['slug']),
                'active' => (bool) $offer['active'],
                'featured' => (bool) $offer['featured'],
                'featured_order' => $offer['featured'] && (int) ($offer['featured_position'] ?? 0) > 0 ? (int) $offer['featured_position'] : null,
                'featured_subtitle' => LegacyText::line($offer['featured_subtitle'] ?? null),
                'couponable' => (bool) $offer['coupon_enabled'],
                'image_offer' => (bool) $offer['image_offer'],
                'xml_enabled' => (bool) $offer['xml_enabled'],
                'partner_offer' => (bool) ($offer['listed_in_partner_offer_list'] ?? false),
                'short_description' => LegacyText::line($offer['cities_html'] ?? null),
                'slider_text' => LegacyText::line($offer['slider_html'] ?? null),
                'seo_title' => $this->seoText($extraFields['seo[title]'] ?? null, $notes),
                'seo_description' => $this->seoText($extraFields['seo[description]'] ?? null, $notes),
                'seo_robots' => LegacyText::line($extraFields['seo[robots]'] ?? null),
                ...$stay,
                'price' => $price,
                'displayed_price' => $price !== null ? number_format($price, 0, ',', '.').' Ft' : null,
                // The legacy texts replace whatever the earlier imports split
                // out of the pages; the program is one block again.
                'program_before' => null,
                'inclusions' => null,
                'payment_program' => null,
                'discounts' => null,
                'notes' => null,
            ],
            html: collect(self::HTML_FIELDS)->map(fn (string $field): ?string => is_string($offer[$field] ?? null) ? $offer[$field] : null)->all(),
            legacyAttributes: [
                'legacy_active' => (bool) $offer['active'],
                'listed_in_admin_offer_list' => $offer['listed_in_admin_offer_list'] ?? null,
                'listed_in_partner_offer_list' => $offer['listed_in_partner_offer_list'] ?? null,
                'featured_position' => $offer['featured_position'] ?? null,
                'admin_list_row' => $offer['admin_list_row'] ?? null,
                'offer_groups' => $offer['offer_groups'] ?? [],
                'seasonal_groups' => $offer['seasonal_groups'] ?? [],
                'regions' => $offer['regions'] ?? [],
                'region_groups' => $offer['region_groups'] ?? [],
                'galleries' => collect(['main_gallery', 'program_gallery', 'intro_gallery'])
                    ->mapWithKeys(fn (string $key): array => [$key => is_array($offer[$key] ?? null) ? ['id' => $offer[$key]['gallery_id'] ?? null, 'name' => $offer[$key]['gallery_name'] ?? null] : null])
                    ->all(),
                'slider_image' => $offer['slider_image'] ?? null,
                'program_pdf' => $offer['program_pdf'] ?? null,
                'extra_fields' => $extraFields,
            ],
            dates: $dates->map(fn (array $date): array => $this->withoutTourStay($date, $stay))->map(fn (array $date): array => collect($date)->except('travel_mode')->all())->all(),
            departurePlaces: $dates->flatMap(fn (array $date): array => $date['departure_places'])->unique('legacy_id')->values()->all(),
            galleries: $this->galleries($offer),
            sliderImageUrl: $offer['slider_image'] ?? null,
            programPdfUrl: $offer['program_pdf'] ?? null,
            taxonomy: [
                'offer_groups' => $this->names($offer['offer_groups'] ?? []),
                'regions' => $this->names($offer['regions'] ?? []),
                'region_groups' => $this->names($offer['region_groups'] ?? []),
                // The legacy XML feed's destination, e.g. "Horvátország" or "Szeged".
                'xml_city' => LegacyText::line($extraFields['xml[city]'] ?? null),
            ],
            partnerBonuses: collect($offer['partner_bonuses'] ?? [])
                ->values()
                ->map(fn (array $bonus, int $index): array => [
                    'legacy_id' => (int) $bonus['legacy_id'],
                    'sort_order' => $index + 1,
                    'label' => sprintf('%s: %d–%d fő', trim((string) ($bonus['section'] ?? 'Bónusz')), $bonus['min'], $bonus['max']),
                    'value' => sprintf('%d ajándék hely', $bonus['free_places']),
                ])
                ->all(),
            notes: array_values(array_unique($notes)),
        );
    }

    /**
     * @param  array<int, string>  $notes
     */
    private function seoText(mixed $value, array &$notes): ?string
    {
        $text = LegacyText::line($value);

        if ($text !== null && in_array(mb_strtolower($text), self::SEO_PLACEHOLDERS, true)) {
            $notes[] = "The legacy SEO field holds the admin's example text (\"{$text}\"); left out.";

            return null;
        }

        return $text;
    }

    /**
     * @param  array<string, mixed>  $departure
     * @param  array<int, string>  $notes
     * @return CatalogDate&array{travel_mode: string|null}
     */
    private function date(array $departure, array &$notes): array
    {
        $fields = $departure['fields'];
        $price = LegacyBookingOptionRules::datePrice($this->number($departure['price'] ?? null), $this->number($departure['sale_price'] ?? null));
        $monitored = (bool) $departure['capacity_monitoring'];
        $seats = $monitored ? max(0, (int) ($departure['capacity'] ?? 0)) : null;

        return [
            'legacy_id' => (int) $departure['legacy_date_id'],
            'start_date' => (string) $departure['start_date'],
            'end_date' => (string) $departure['end_date'],
            'price' => $price['price'],
            'price_box_price' => $price['price'],
            'price_box_original_price' => $price['original_price'],
            'price_box_displayed_price' => null,
            'price_box_discount_badge' => LegacyBookingOptionRules::discountBadge($this->number($fields['last_minute'] ?? null)),
            'price_box_label' => LegacyText::line($fields['comment'] ?? null),
            'price_box_available_seats' => $seats,
            'status' => match (true) {
                ! $departure['active'] || $departure['status'] !== 'active' => TourDateStatus::CANCELLED,
                $seats === 0 => TourDateStatus::SOLD_OUT,
                default => TourDateStatus::AVAILABLE,
            },
            'travel_mode' => LegacyBookingOptionRules::travelMode($fields['travel']['label'] ?? null),
            'accommodation' => LegacyText::line($fields['accommodation'] ?? null),
            'accommodation_info' => LegacyText::note($fields['accommodation_info'] ?? null, $fields['accommodation'] ?? null),
            'catering' => LegacyText::line($fields['provision'] ?? null),
            'catering_info' => LegacyText::note($fields['provision_info'] ?? null, $fields['provision'] ?? null),
            'legacy_attributes' => [
                ...collect($departure)->only(self::DATE_LEGACY_FIELDS)->all(),
                'travel' => $fields['travel'] ?? null,
                ...collect($fields)->only(self::DATE_LEGACY_FORM_FIELDS)->all(),
            ],
            'extras' => $this->extras($departure, $notes),
            'departure_places' => collect($departure['boarding_points'])
                ->map(fn (array $point): ?array => ($place = LegacyBookingOptionRules::departurePlace((string) $point['label'])) !== null
                    ? ['legacy_id' => (int) $point['legacy_id'], ...$place]
                    : null)
                ->filter()
                ->values()
                ->all(),
        ];
    }

    /**
     * The date's extras, then its resort fees: in forints charged with the
     * booking, in euros paid on site. A resort fee the legacy admin also
     * lists as an extra is not added twice.
     *
     * @param  array<string, mixed>  $departure
     * @param  array<int, string>  $notes
     * @return array<int, CatalogExtra>
     */
    private function extras(array $departure, array &$notes): array
    {
        $extras = collect($departure['extra_prices'])
            ->values()
            ->map(fn (array $extra, int $index): array => [
                'legacy_id' => (int) $extra['legacy_id'],
                'name' => trim((string) $extra['name']),
                'price' => (float) $extra['price'],
                'currency' => LegacyBookingOptionRules::currency((string) $extra['unit']),
                'price_unit' => LegacyBookingOptionRules::priceUnit((string) $extra['unit']),
                'charge_rule' => LegacyBookingOptionRules::chargeRule((string) ($extra['type'] ?? '')),
                'sort_order' => $index + 1,
            ]);
        $listsResortFee = $extras->contains(fn (array $extra): bool => LegacyBookingOptionRules::isResortFee($extra['name']));

        foreach ([TourExtraCurrency::HUF => 'resort_fee', TourExtraCurrency::EUR => 'resort_fee_eur'] as $currency => $field) {
            $fee = $this->number($departure['fields'][$field] ?? null);

            if ($fee === null || $fee <= 0) {
                continue;
            }

            if ($listsResortFee && $currency === TourExtraCurrency::HUF) {
                $notes[] = "Date {$departure['legacy_date_id']}: the resort fee is listed as an extra too; it is charged once.";

                continue;
            }

            $extras->push(['legacy_id' => null, ...LegacyBookingOptionRules::resortFee($fee, $currency), 'sort_order' => $extras->count() + 1]);
        }

        return $extras->all();
    }

    /**
     * The tour's accommodation and meals: those of most of its dates.
     *
     * @param  Collection<int, array<string, mixed>>  $dates
     * @return array{accommodation: string|null, accommodation_info: string|null, catering: string|null, catering_info: string|null}
     */
    private function tourStay(Collection $dates): array
    {
        $accommodation = $this->mostCommon($dates->map(fn (array $date): ?string => $this->pair($date['accommodation'], $date['accommodation_info']))->filter());
        $catering = $this->mostCommon($dates->map(fn (array $date): ?string => $this->pair($date['catering'], $date['catering_info']))->filter());

        [$accommodationName, $accommodationInfo] = $accommodation !== null ? json_decode($accommodation, true) : [null, null];
        [$cateringName, $cateringInfo] = $catering !== null ? json_decode($catering, true) : [null, null];

        return [
            'accommodation' => $accommodationName,
            'accommodation_info' => $accommodationInfo,
            'catering' => $cateringName,
            'catering_info' => $cateringInfo,
        ];
    }

    /**
     * A date keeps its own accommodation and meals only where they differ
     * from the tour's (null: the tour's).
     *
     * @param  array<string, mixed>  $date
     * @param  array<string, string|null>  $stay
     * @return array<string, mixed>
     */
    private function withoutTourStay(array $date, array $stay): array
    {
        foreach ([['accommodation', 'accommodation_info'], ['catering', 'catering_info']] as [$name, $info]) {
            if ($this->pair($date[$name], $date[$info]) === $this->pair($stay[$name], $stay[$info])) {
                $date[$name] = $date[$info] = null;
            }
        }

        return $date;
    }

    /**
     * From the upcoming bookable dates if any, else from every date.
     *
     * @param  Collection<int, array<string, mixed>>  $dates
     */
    private function tourPrice(Collection $dates, CarbonInterface $today): ?float
    {
        $prices = fn (Collection $dates): Collection => $dates->pluck('price')->filter(fn (?float $price): bool => $price !== null && $price > 0);
        $upcoming = $dates->filter(fn (array $date): bool => $date['status'] === TourDateStatus::AVAILABLE && $date['start_date'] >= $today->toDateString());

        return $prices($upcoming)->min() ?? $prices($dates)->min();
    }

    /**
     * @param  array<string, mixed>  $offer
     * @return array<string, array<int, CatalogImage>>
     */
    private function galleries(array $offer): array
    {
        $main = $this->images($offer['main_gallery'] ?? null);
        $program = $this->images($offer['program_gallery'] ?? null);

        return array_filter([
            TourGalleryItem::MAIN => $main,
            // Mostly the main gallery again; kept only when it is another one.
            TourGalleryItem::PROGRAM => array_column($program, 'url') !== array_column($main, 'url') ? $program : [],
            TourGalleryItem::INTRO => $this->images($offer['intro_gallery'] ?? null),
        ]);
    }

    /**
     * @return array<int, CatalogImage>
     */
    private function images(mixed $gallery): array
    {
        return collect(is_array($gallery) ? ($gallery['images'] ?? []) : [])
            ->sortBy('order')
            ->values()
            ->map(fn (array $image, int $index): array => [
                'legacy_image_id' => (int) $image['image_id'],
                'url' => (string) $image['url'],
                'sort_order' => $index + 1,
                'title' => LegacyText::line($image['title'] ?? null),
            ])
            ->all();
    }

    /**
     * @param  Collection<int, string>  $values
     */
    private function mostCommon(Collection $values): ?string
    {
        $counts = $values->countBy();
        $highest = $counts->max();

        // Ties go to the earliest date's value.
        return $values->first(fn (string $value): bool => $counts[$value] === $highest);
    }

    private function pair(?string $name, ?string $info): ?string
    {
        return $name === null && $info === null ? null : json_encode([$name, $info], JSON_UNESCAPED_UNICODE);
    }

    /**
     * @param  array<int, mixed>  $names
     * @return array<int, string>
     */
    private function names(array $names): array
    {
        return collect($names)->map(fn (mixed $name): string => trim((string) $name))->filter()->unique()->values()->all();
    }

    private function number(mixed $value): ?float
    {
        $digits = preg_replace('/[^\d.,]/', '', (string) $value);

        return $digits !== '' && $digits !== null ? (float) str_replace(',', '.', $digits) : null;
    }
}
