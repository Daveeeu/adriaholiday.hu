<?php

namespace App\Services\Legacy\AdminExport;

use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use App\Support\Legacy\Apartments\LegacyApartmentExport;

/**
 * The apartments of the full admin export in the shape the existing legacy
 * apartment import reads (LegacyApartmentExport), so the full export updates
 * apartments with the same, tested mapping. The apartments the legacy admin
 * keeps active count as the ones its site listed.
 */
final class LegacyAdminExportApartmentAdapter
{
    /**
     * Export entity => legacy apartment list (config legacy_apartments.types).
     */
    private const LISTS = [
        'apartment.apartment' => 'apartment',
        'apartment.apartment_greece' => 'greece',
        'apartment.apartment_bulgaria' => 'bulgaria',
        'apartment.apartment_montenegro' => 'montenegro',
        'apartment.apartment_croatia_new' => 'croatia',
        'apartment.apartment_croatia_old' => 'croatia',
    ];

    public function adapt(LegacyAdminExport $export): LegacyApartmentExport
    {
        $apartments = [];
        $listed = [];

        foreach (self::LISTS as $entity => $list) {
            foreach ($export->records($entity) as $record) {
                if ($record->legacyId() === null) {
                    continue;
                }

                $active = $record->listValue('Aktív?') === 'Aktív';
                $seoName = $record->field('seo_name');

                if ($active && $seoName !== null) {
                    $listed[] = $seoName;
                }

                $apartments[] = [
                    'legacy_id' => $record->legacyId(),
                    'legacy_list' => $list,
                    'legacy_kind' => $record->listValue('Apartman/Síszállás'),
                    'active' => $active,
                    'featured_list' => $record->listValue('Kiemelt?') === 'Kiemelt',
                    'admin' => $this->form($record),
                ];
            }
        }

        return new LegacyApartmentExport(
            path: $export->path,
            sha256: $export->sha256,
            generatedAt: $export->exportedAt,
            apartments: $apartments,
            places: $this->byId($export, 'apartment.place', fn (LegacyAdminExportRecord $place): array => [
                'id' => (string) $place->legacyId(),
                'name' => $place->field('name'),
                'seo_name' => $place->field('seo_name'),
                'location_id' => $place->selected('location_id'),
                'location_type' => $place->selected('location_type'),
                'description' => $place->field('description'),
                'description_bottom' => $place->field('description_bottom'),
                ...$this->seo($place),
            ]),
            regions: $this->byId($export, 'apartment.region', fn (LegacyAdminExportRecord $region): array => [
                'id' => (string) $region->legacyId(),
                'city' => $region->field('city'),
                'city_hu' => $region->field('city_hu'),
                'country' => $region->field('country') ?? $region->listValue('Ország'),
                'seo_name' => $region->field('seo_name'),
                'region_type' => $region->selected('region_type'),
                'apartments_information' => $region->field('apartments_information'),
                ...$this->seo($region),
            ]),
            galleries: collect($export->recordsById('gallery.gallery'))
                ->map(fn (LegacyAdminExportRecord $gallery): array => array_map(fn (array $image): array => [
                    'legacy_image_id' => $image['image_id'] ?? null,
                    'path' => $image['path'] ?? null,
                    'title' => $image['title'] ?? null,
                    'main' => false,
                    'position' => (int) ($image['order'] ?? 0),
                ], $gallery->galleryImages()))
                ->all(),
            listedSeoNames: array_values(array_unique($listed)),
        );
    }

    /**
     * The edit form with its legacy field names ("seo[title]").
     *
     * @return array<string, mixed>
     */
    private function form(LegacyAdminExportRecord $record): array
    {
        $fields = $record->raw['fields'] ?? [];

        return [
            'id' => (string) $record->legacyId(),
            'name' => $record->field('name'),
            'seo_name' => $record->field('seo_name'),
            'quality' => $record->field('quality'),
            'code' => $record->field('code'),
            'code_min' => $record->field('code_min'),
            'code_max' => $record->field('code_max'),
            'address' => $record->field('address'),
            'address_maps' => $record->field('address_maps'),
            'coordinates_maps' => $record->field('coordinates_maps'),
            'description' => $record->field('description'),
            'additional_informations' => $record->field('additional_informations'),
            'category' => $record->field('category'),
            'all_inclusive' => $record->field('all_inclusive'),
            'price_header' => $record->field('price_header'),
            'price_header_inside' => $record->field('price_header_inside'),
            'price_table' => is_array($fields['price_table'] ?? null) ? $fields['price_table'] : [],
            'services' => $record->checkedIds('services'),
            'place_id' => $record->selected('place_id'),
            'location_id' => $record->selected('location_id'),
            'gallery_id' => $record->selected('gallery_id'),
            ...$this->seo($record),
        ];
    }

    /**
     * @return array<string, string|null>
     */
    private function seo(LegacyAdminExportRecord $record): array
    {
        return [
            'seo[title]' => $record->field('seo.title'),
            'seo[description]' => $record->field('seo.description'),
            'seo[robots]' => $record->field('seo.robots'),
        ];
    }

    /**
     * @param  callable(LegacyAdminExportRecord): array<string, mixed>  $map
     * @return array<int, array<string, mixed>>
     */
    private function byId(LegacyAdminExport $export, string $entity, callable $map): array
    {
        return array_map($map, $export->recordsById($entity));
    }
}
