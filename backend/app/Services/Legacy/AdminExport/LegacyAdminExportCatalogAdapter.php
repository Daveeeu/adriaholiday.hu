<?php

namespace App\Services\Legacy\AdminExport;

use App\Models\LegacyImportRecord;
use App\Support\HufPrice;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use App\Support\Legacy\Catalog\LegacyCatalog;

/**
 * The tours of the full admin export in the shape the existing legacy catalog
 * import reads (LegacyCatalog), so the full export updates tours with the
 * same, tested mapping.
 *
 * The admin forms hold most, not all, of what the catalog file had (e.g. the
 * program footer and the coupon acceptance came from the public site): each
 * offer therefore starts from the catalog record imported before, and the
 * export overwrites what it does hold.
 */
final class LegacyAdminExportCatalogAdapter
{
    /**
     * Export entity => whether its offers are the partner ("szervezés alatti") ones.
     */
    private const SOURCES = [
        'roundtrip.offer' => false,
        'roundtrip.teahcer_offer' => true,
    ];

    private const REGION_TYPE = 'Régió';

    public function adapt(LegacyAdminExport $export): LegacyCatalog
    {
        $regions = $export->recordsById('roundtrip.region');
        $groups = $export->recordsById('roundtrip.offer_group');
        $galleries = $export->recordsById('gallery.gallery');
        $boardingPoints = $export->recordsById('roundtrip.felszallas');
        $offers = [];

        foreach (self::SOURCES as $entity => $partner) {
            foreach ($export->records($entity) as $record) {
                if ($record->legacyId() !== null && $record->field('seo_name') !== null) {
                    $offers[$record->legacyId()] = $this->offer($record, $partner, $export, $regions, $groups, $galleries, $boardingPoints);
                }
            }
        }

        return new LegacyCatalog(
            path: $export->path,
            sha256: $export->sha256,
            generatedAt: $export->exportedAt,
            declaredCount: count($offers),
            reference: [
                'offer_groups' => array_values(array_map(fn (LegacyAdminExportRecord $group): array => ['id' => $group->legacyId(), 'name' => $group->field('name')], $groups)),
                'regions' => array_values(array_map(fn (LegacyAdminExportRecord $region): array => ['id' => $region->legacyId(), 'name' => $region->field('name'), 'type' => $region->listValue('Típus')], $regions)),
                'boarding_points' => array_values(array_map(fn (LegacyAdminExportRecord $point): array => [
                    'id' => $point->legacyId(),
                    'name' => $point->field('name'),
                    'city' => $point->field('city'),
                    'fee' => (int) $point->field('price'),
                ], $boardingPoints)),
            ],
            offers: array_values($offers),
        );
    }

    /**
     * @param  array<int, LegacyAdminExportRecord>  $regions
     * @param  array<int, LegacyAdminExportRecord>  $groups
     * @param  array<int, LegacyAdminExportRecord>  $galleries
     * @param  array<int, LegacyAdminExportRecord>  $boardingPoints
     * @return array<string, mixed>
     */
    private function offer(LegacyAdminExportRecord $record, bool $partner, LegacyAdminExport $export, array $regions, array $groups, array $galleries, array $boardingPoints): array
    {
        $legacyId = (int) $record->legacyId();
        $base = $this->previousPayload($legacyId);
        $regionNames = $this->names($record->checkedIds('regions'), $regions);
        $groupNames = array_values(array_map(fn (LegacyAdminExportRecord $group): string => (string) $group->field('name'), array_intersect_key($groups, array_flip($record->checkedIds('groups')))));

        return [
            ...$base,
            'legacy_id' => $legacyId,
            'name' => $record->field('name'),
            'slug' => $record->field('seo_name'),
            'subtitle_1' => $record->field('name_sub_1'),
            'subtitle_2' => $record->field('name_sub_2'),
            'featured_subtitle' => $record->field('adventaged_subtitle'),
            'active' => ! $partner && $record->listValue('Aktív?') === 'Aktív',
            'featured' => $record->listValue('Kiemelt?') === 'Kiemelt',
            'featured_position' => $base['featured_position'] ?? null,
            'coupon_enabled' => (bool) ($base['coupon_enabled'] ?? false),
            'image_offer' => $record->listValue('Képes ajánlat?') === 'Képes ajánlat',
            'xml_enabled' => $record->listValue('XML-ben szerepel?') === 'Igen' || isset($record->raw['fields']['xml']['travel_type']),
            'listed_in_admin_offer_list' => ! $partner,
            'listed_in_partner_offer_list' => $partner,
            'description_html' => $record->field('description'),
            'cities_html' => $record->field('cities_affected'),
            'program_html' => $record->field('program'),
            'program_footer_html' => $base['program_footer_html'] ?? null,
            'entrance_fees_html' => $record->field('tickets'),
            'optional_program_html' => $record->field('facultative'),
            'prices_html' => $record->field('price_text'),
            'intro_html' => $record->field('favorable_text'),
            'slider_html' => $record->field('slide_text'),
            'regions' => array_values(array_filter($regionNames, fn (string $name, int $id): bool => $regions[$id]->listValue('Típus') === self::REGION_TYPE, ARRAY_FILTER_USE_BOTH)),
            'region_groups' => array_values(array_filter($regionNames, fn (string $name, int $id): bool => $regions[$id]->listValue('Típus') !== self::REGION_TYPE, ARRAY_FILTER_USE_BOTH)),
            'offer_groups' => $groupNames,
            'seasonal_groups' => $groupNames,
            'main_gallery' => $this->gallery($record->selectedId('main_gallery_id'), $galleries, $export),
            'program_gallery' => $this->gallery($record->selectedId('program_gallery_id'), $galleries, $export),
            'intro_gallery' => $this->gallery($record->selectedId('favorable_gallery_id'), $galleries, $export),
            'slider_image' => $export->fileUrl($record->field('slide_image')),
            'program_pdf' => $export->fileUrl($record->selected('program_pdf')),
            'departures' => $this->departures($export->relation('roundtrip_offer_dates', $legacyId), $boardingPoints),
            'partner_bonuses' => $base['partner_bonuses'] ?? [],
            'extra_fields' => array_filter([
                'seo[title]' => $record->field('seo.title'),
                'seo[description]' => $record->field('seo.description'),
                'seo[robots]' => $record->field('seo.robots'),
                'showable_dates' => $record->field('showable_dates'),
                'xml[city]' => $record->field('xml.city'),
                'xml[accommodation_name]' => $record->field('xml.accommodation_name'),
                'xml[insurance_value]' => $record->field('xml.insurance_value'),
            ], fn (?string $value): bool => $value !== null),
            'admin_list_row' => [
                'region' => $record->listValue('Régió'),
                'group' => $record->listValue('Csoport'),
                'featured' => $record->listValue('Kiemelt?'),
                'active' => $record->listValue('Aktív?'),
                'image_offer' => $record->listValue('Képes ajánlat?'),
                'xml' => $record->listValue('XML-ben szerepel?'),
            ],
        ];
    }

    /**
     * The catalog record the offer was imported from before, if any.
     *
     * @return array<string, mixed>
     */
    private function previousPayload(int $legacyId): array
    {
        $record = LegacyImportRecord::query()->where('entity', LegacyImportRecord::OFFER)->where('legacy_id', $legacyId)->first();

        return $record?->payload() ?? [];
    }

    /**
     * @param  array<int, int>  $ids
     * @param  array<int, LegacyAdminExportRecord>  $records
     * @return array<int, string> names keyed by legacy id
     */
    private function names(array $ids, array $records): array
    {
        return collect($ids)
            ->filter(fn (int $id): bool => isset($records[$id]))
            ->mapWithKeys(fn (int $id): array => [$id => (string) $records[$id]->field('name')])
            ->all();
    }

    /**
     * @param  array<int, LegacyAdminExportRecord>  $galleries
     * @return array<string, mixed>|null
     */
    private function gallery(?int $id, array $galleries, LegacyAdminExport $export): ?array
    {
        $gallery = $id !== null ? ($galleries[$id] ?? null) : null;

        if ($gallery === null) {
            return null;
        }

        return [
            'gallery_id' => $id,
            'gallery_name' => $gallery->field('name'),
            'images' => array_values(array_filter(array_map(fn (array $image): ?array => is_numeric($image['image_id'] ?? null) && ($url = $export->fileUrl($image['path'] ?? null)) !== null ? [
                'order' => (int) ($image['order'] ?? 0),
                'image_id' => (int) $image['image_id'],
                'url' => $url,
                'title' => LegacyAdminExportRecord::text($image['title'] ?? null),
            ] : null, $gallery->galleryImages()))),
        ];
    }

    /**
     * @param  array<int|string, mixed>  $dates  the offer's date list: summary, form fields, JavaScript selections and extras
     * @param  array<int, LegacyAdminExportRecord>  $boardingPoints
     * @return array<int, array<string, mixed>>
     */
    private function departures(array $dates, array $boardingPoints): array
    {
        $departures = [];

        foreach ($dates as $date) {
            $fields = is_array($date['fields'] ?? null) ? $date['fields'] : [];
            $selected = is_array($date['selected'] ?? null) ? $date['selected'] : [];
            $id = is_numeric($date['date_id'] ?? null) ? (int) $date['date_id'] : null;
            $start = LegacyAdminExportRecord::dateTime($fields['date_date_from'] ?? null);

            if ($id === null || $start === null) {
                continue;
            }

            $status = (string) ($selected['status'] ?? $fields['status']['value'] ?? 'active');
            $end = LegacyAdminExportRecord::dateTime($fields['date_date_to'] ?? null) ?? $start;
            $departures[] = [
                'legacy_date_id' => $id,
                'list_text' => $date['summary'] ?? null,
                'start_date' => $start->toDateString(),
                'end_date' => max($start, $end)->toDateString(),
                'price' => (float) ($fields['price'] ?? 0),
                'sale_price' => is_numeric($fields['sale_price'] ?? null) ? (float) $fields['sale_price'] : null,
                'currency' => 'HUF',
                'status' => $status === 'active' ? 'active' : 'inactive',
                'active' => $status === 'active',
                'xml_enabled' => ($selected['xml_listed'] ?? $fields['xml_listed']['value'] ?? '0') === '1',
                'holiday_home' => ($selected['holiday_home'] ?? $fields['holiday_home']['value'] ?? '0') === '1',
                'capacity_monitoring' => ($selected['space_number_monitoring'] ?? $fields['space_number_monitoring']['value'] ?? '0') === '1',
                'capacity' => is_numeric($fields['space_number'] ?? null) ? (int) $fields['space_number'] : null,
                'boarding_points' => $this->boardingPoints(is_array($fields['felszallas'] ?? null) ? array_keys($fields['felszallas']) : [], $boardingPoints),
                'extra_prices' => $this->extras(is_array($date['extras'] ?? null) ? $date['extras'] : []),
                'fields' => [
                    'travel' => isset($selected['travel']) && $selected['travel'] !== '' ? ['value' => (string) $selected['travel'], 'label' => $this->travelLabel((string) ($date['summary'] ?? ''))] : null,
                    ...array_intersect_key($fields, array_flip(['accommodation', 'accommodation_cesys', 'accommodation_email_info', 'accommodation_info', 'accommodation_info_cesys', 'provision', 'provision_info', 'resort_fee', 'resort_fee_eur', 'last_minute', 'price_info', 'comment'])),
                ],
            ];
        }

        return $departures;
    }

    /**
     * @param  array<int, int|string>  $ids
     * @param  array<int, LegacyAdminExportRecord>  $boardingPoints
     * @return array<int, array{legacy_id: int, label: string}>
     */
    private function boardingPoints(array $ids, array $boardingPoints): array
    {
        return collect($ids)
            ->map(fn (int|string $id): int => (int) $id)
            ->filter(fn (int $id): bool => isset($boardingPoints[$id]))
            ->map(fn (int $id): array => [
                'legacy_id' => $id,
                'label' => sprintf('%s(+%s/fő)', $boardingPoints[$id]->field('name'), HufPrice::format((int) $boardingPoints[$id]->field('price'))),
            ])
            ->values()
            ->all();
    }

    /**
     * Extras of a date, each a legacy list line "name | price | unit | type | raw".
     *
     * @param  array<int, mixed>  $extras
     * @return array<int, array<string, mixed>>
     */
    private function extras(array $extras): array
    {
        return collect($extras)
            ->filter(fn (mixed $extra): bool => is_array($extra) && is_numeric($extra['legacy_id'] ?? null) && is_string($extra['line'] ?? null))
            ->map(function (array $extra): ?array {
                $parts = array_map('trim', explode('|', $extra['line']));

                return isset($parts[0], $parts[1], $parts[2]) && $parts[0] !== '' && is_numeric($parts[1]) ? [
                    'legacy_id' => (int) $extra['legacy_id'],
                    'name' => $parts[0],
                    'price' => (float) $parts[1],
                    'unit' => $parts[2],
                    'type' => ($parts[3] ?? '') !== '' ? $parts[3] : null,
                    'raw' => $parts[4] ?? '',
                ] : null;
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * The travel mode label the legacy date list shows ("2027-05-12 — 2027-05-15 | Autóbusszal | …").
     */
    private function travelLabel(string $summary): ?string
    {
        $parts = array_map('trim', explode('|', $summary));

        return isset($parts[1]) && $parts[1] !== '' ? $parts[1] : null;
    }
}
