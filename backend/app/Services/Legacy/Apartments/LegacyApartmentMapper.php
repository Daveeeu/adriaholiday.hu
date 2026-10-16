<?php

namespace App\Services\Legacy\Apartments;

use App\Models\Apartment;
use App\Support\Apartment\ApartmentPriceTable;
use App\Support\Apartment\ApartmentServiceCatalog;
use App\Support\Legacy\Apartments\LegacyApartmentData;
use App\Support\Legacy\Apartments\LegacyApartmentExport;
use App\Support\Legacy\Apartments\LegacyApartmentHtml;
use App\Support\Legacy\Apartments\LegacyApartmentPriceTable;
use App\Support\Legacy\LegacyText;

/**
 * Maps one record of the legacy apartment export onto the new apartment's
 * attributes, without touching the database. The record carries the legacy
 * admin's edit form ("admin") and, for the apartments the legacy site listed,
 * what their public page showed ("public").
 */
final class LegacyApartmentMapper
{
    /**
     * @param  array<string, mixed>  $record
     */
    public function map(array $record, LegacyApartmentExport $export): LegacyApartmentData
    {
        $legacyId = (int) $record['legacy_id'];
        $form = is_array($record['admin'] ?? null) ? $record['admin'] : [];
        $public = is_array($record['public'] ?? null) ? $record['public'] : [];
        $list = (string) ($record['legacy_list'] ?? '');
        $warnings = [];

        $name = LegacyText::line($form['name'] ?? null) ?? "Apartman {$legacyId}";
        $seoName = trim((string) ($form['seo_name'] ?? ''));
        $listed = $seoName !== '' && in_array($seoName, $export->listedSeoNames, true);
        $pricing = LegacyApartmentPriceTable::toPricingMatrix(is_array($form['price_table'] ?? null) ? $form['price_table'] : []);
        [$latitude, $longitude] = $this->coordinates($form['coordinates_maps'] ?? null);
        $description = LegacyApartmentHtml::prepare($form['description'] ?? null);
        $placeId = $this->placeId($legacyId, $form['place_id'] ?? null);

        if ($seoName === '') {
            $warnings[] = 'No URL name in the legacy admin; the URL is made from the name.';
        }

        if ($pricing === null) {
            $warnings[] = 'No price table.';
        }

        if ($latitude === null) {
            $warnings[] = 'No usable map coordinates.';
        }

        if ($placeId === null) {
            $warnings[] = 'No place.';
        }

        $services = collect(is_array($form['services'] ?? null) ? $form['services'] : [])
            ->map(fn (mixed $id): ?string => is_numeric($id) ? ApartmentServiceCatalog::keyForLegacyId((int) $id) : null)
            ->filter()
            ->unique()
            ->values()
            ->all();

        return new LegacyApartmentData(
            legacyId: $legacyId,
            list: $list,
            placeId: $placeId,
            listed: $listed,
            attributes: [
                'legacy_id' => $legacyId,
                'type' => (string) (config("legacy_apartments.types.{$list}.slug") ?? $list),
                'name' => $name,
                'slug' => $seoName !== '' ? $seoName : str($name)->slug()->toString(),
                'seo_name' => $seoName !== '' ? $seoName : null,
                'seo_auto_generate' => false,
                'seo_title' => $this->line($form['seo[title]'] ?? null),
                'seo_description' => $this->line($form['seo[description]'] ?? null),
                'seo_robots' => $this->line($form['seo[robots]'] ?? null),
                'code' => $this->code($form),
                'is_active' => $listed,
                'status' => $listed ? Apartment::STATUS_PUBLISHED : Apartment::STATUS_DRAFT,
                'featured' => (bool) ($record['featured_list'] ?? false),
                'is_accommodation' => false,
                'stars' => max(0, min(5, (int) ($form['quality'] ?? 0))),
                'bedrooms' => 0,
                'bathrooms' => 0,
                'max_guests' => ApartmentPriceTable::maxGuests($pricing) ?? 0,
                'size_m2' => 0,
                'distance_to_center_m' => $this->distance($public['central_distance'] ?? null) ?? $this->distance($form['central_distance'] ?? null),
                'distance_to_sea_m' => $this->distance($public['sea_distance'] ?? null) ?? $this->distance($form['sea_distance'] ?? null),
                'address' => LegacyText::line($form['address'] ?? null) ?? '',
                'map_address' => LegacyText::line($form['address_maps'] ?? null),
                'latitude' => $latitude,
                'longitude' => $longitude,
                'coordinates' => $latitude !== null ? "{$latitude}, {$longitude}" : null,
                // The legacy lists and pages show the same single description.
                'short_description' => $description ?? '',
                'description' => $description,
                'additional_information' => LegacyApartmentHtml::prepare($form['additional_informations'] ?? null),
                'apartment_type_content' => LegacyApartmentHtml::prepare($form['category'] ?? null),
                'all_inclusive_description' => LegacyApartmentHtml::prepare($form['all_inclusive'] ?? null),
                'price_header' => $this->line($form['price_header'] ?? null),
                'price_inner_header' => $this->line($form['price_header_inside'] ?? null) ?? $this->line($form['price_list_apartment_type'] ?? null),
                'pricing_matrix' => $pricing,
                'services' => $services,
                'legacy_attributes' => array_filter([
                    'list' => $list,
                    'kind' => $record['legacy_kind'] ?? null,
                    'name' => $form['name'] ?? null,
                    'code_min' => $form['code_min'] ?? null,
                    'code_max' => $form['code_max'] ?? null,
                    'place_id' => $form['place_id'] ?? null,
                    'region_id' => $form['location_id'] ?? null,
                    'gallery_id' => $form['gallery_id'] ?? null,
                    'service_ids' => $form['services'] ?? null,
                    'price_list_last_row' => $this->line($form['price_list_last_row'] ?? null),
                    'price_list_last_row_2' => $this->line($form['price_list_last_row_2'] ?? null),
                    'listed_on_legacy_site' => $listed,
                ], fn (mixed $value): bool => $value !== null && $value !== '' && $value !== []),
            ],
            images: $this->images($form['gallery_id'] ?? null, $export),
            warnings: $warnings,
        );
    }

    /**
     * The apartment's code: the legacy "code from" (and "to", when the
     * apartment covers a range of codes, e.g. "768-A").
     *
     * @param  array<string, mixed>  $form
     */
    private function code(array $form): ?string
    {
        $from = trim((string) ($form['code_min'] ?? ''));
        $to = trim((string) ($form['code_max'] ?? ''));

        if ($from === '') {
            return $to !== '' ? $to : null;
        }

        return $to === '' || $to === $from ? $from : "{$from}-{$to}";
    }

    private function placeId(int $legacyId, mixed $placeId): ?int
    {
        if (is_numeric($placeId)) {
            return (int) $placeId;
        }

        $fallback = config("legacy_apartments.apartment_places.{$legacyId}");

        return is_int($fallback) ? $fallback : null;
    }

    /**
     * @return array{0: float|null, 1: float|null}
     */
    private function coordinates(mixed $value): array
    {
        if (! is_string($value) || ! preg_match('/^\s*\(?\s*(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*\)?\s*$/', $value, $match)) {
            return [null, null];
        }

        $latitude = round((float) $match[1], 7);
        $longitude = round((float) $match[2], 7);

        return abs($latitude) <= 90 && abs($longitude) <= 180 ? [$latitude, $longitude] : [null, null];
    }

    /**
     * Metres of a legacy distance ("300m", "1,2 km", "50").
     */
    private function distance(mixed $value): ?int
    {
        if (! is_string($value) && ! is_numeric($value)) {
            return null;
        }

        if (! preg_match('/(\d+(?:[.,]\d+)?)\s*(km|m)?/i', (string) $value, $match)) {
            return null;
        }

        $amount = (float) str_replace(',', '.', $match[1]);
        $metres = (int) round(strtolower($match[2] ?? '') === 'km' ? $amount * 1000 : $amount);

        return $metres > 0 ? $metres : null;
    }

    private function line(mixed $value): ?string
    {
        return is_string($value) ? LegacyText::line($value) : null;
    }

    /**
     * The gallery's images, its cover image first.
     *
     * @return list<array{legacy_image_id: int|null, url: string, title: string|null}>
     */
    private function images(mixed $galleryId, LegacyApartmentExport $export): array
    {
        $baseUrl = rtrim((string) config('services.legacy_adria.base_url'), '/');

        return collect($export->galleryImages(is_numeric($galleryId) ? (int) $galleryId : null))
            ->filter(fn (array $image): bool => is_string($image['path'] ?? null) && trim($image['path']) !== '')
            ->sortBy([
                fn (array $a, array $b): int => (int) ($b['main'] ?? false) <=> (int) ($a['main'] ?? false),
                fn (array $a, array $b): int => (int) ($a['position'] ?? 0) <=> (int) ($b['position'] ?? 0),
            ])
            ->map(fn (array $image): array => [
                'legacy_image_id' => is_numeric($image['legacy_image_id'] ?? null) ? (int) $image['legacy_image_id'] : null,
                'url' => $baseUrl.'/'.ltrim(trim($image['path']), '/'),
                'title' => $this->line($image['title'] ?? null),
            ])
            ->values()
            ->all();
    }
}
