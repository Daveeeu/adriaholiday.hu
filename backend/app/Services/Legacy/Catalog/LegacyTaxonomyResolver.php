<?php

namespace App\Services\Legacy\Catalog;

use App\Support\Legacy\LegacyCountryDictionary;

/**
 * Maps a legacy offer's groups and regions onto the new site's portfolio
 * categories and countries, following config/legacy_catalog.php: only the
 * unambiguous matches listed there are linked, everything else is reported
 * as unmapped.
 */
final class LegacyTaxonomyResolver
{
    /**
     * A country comes from the legacy regions; an offer without any takes
     * the legacy XML destination only when it names a country exactly.
     * Countries and categories the office approved for the offer
     * (legacy_catalog.offers) are added to these.
     *
     * @param  array{legacy_id?: int, offer_groups: array<int, string>, regions: array<int, string>, region_groups: array<int, string>, xml_city?: string|null}  $taxonomy
     * @return array{categories: array<int, string>, countries: array<int, array{code: string, name: string, region_slug: ?string}>, country_source: string|null, unmapped: array{offer_groups: array<int, string>, regions: array<int, string>, region_groups: array<int, string>}}
     */
    public function resolve(array $taxonomy): array
    {
        [$offerGroupCategories, $unmappedOfferGroups] = $this->categories($taxonomy['offer_groups'], 'offer_groups');
        [$regionGroupCategories, $unmappedRegionGroups] = $this->categories($taxonomy['region_groups'], 'region_groups');
        $countries = [];
        $unmappedRegions = [];

        foreach ($taxonomy['regions'] as $region) {
            $country = $this->country($region);

            if ($country === null) {
                $unmappedRegions[] = $region;
            } else {
                $countries[$country['code']] ??= $country;
            }
        }

        $source = $countries !== [] ? 'regions' : null;
        $xmlCountry = $countries === [] && ($taxonomy['xml_city'] ?? null) !== null ? LegacyCountryDictionary::find($taxonomy['xml_city']) : null;

        if ($xmlCountry !== null) {
            $countries[$xmlCountry['code']] = $xmlCountry;
            $source = 'xml_city';
        }

        $approved = (array) config('legacy_catalog.offers.'.($taxonomy['legacy_id'] ?? 0), []);

        foreach ((array) ($approved['countries'] ?? []) as $slug) {
            $country = LegacyCountryDictionary::find((string) $slug);

            if ($country !== null && ! isset($countries[$country['code']])) {
                $countries[$country['code']] = $country;
                $source ??= 'approved';
            }
        }

        return [
            'categories' => array_values(array_unique([...$offerGroupCategories, ...$regionGroupCategories, ...(array) ($approved['categories'] ?? [])])),
            'countries' => array_values($countries),
            'country_source' => $source,
            'unmapped' => [
                'offer_groups' => $unmappedOfferGroups,
                'regions' => $unmappedRegions,
                'region_groups' => $unmappedRegionGroups,
            ],
        ];
    }

    /**
     * @param  array<int, string>  $names
     * @return array{0: array<int, string>, 1: array<int, string>} category names and unmapped names
     */
    private function categories(array $names, string $mapKey): array
    {
        $map = (array) config("legacy_catalog.{$mapKey}", []);
        $categories = [];
        $unmapped = [];

        foreach ($names as $name) {
            $category = $map[$name] ?? null;

            if (is_string($category) && $category !== '') {
                $categories[] = $category;
            } else {
                $unmapped[] = $name;
            }
        }

        return [$categories, $unmapped];
    }

    /**
     * @return array{code: string, name: string, region_slug: ?string}|null
     */
    private function country(string $region): ?array
    {
        $overrides = (array) config('legacy_catalog.regions', []);

        if (array_key_exists($region, $overrides)) {
            return is_string($overrides[$region]) ? LegacyCountryDictionary::find($overrides[$region]) : null;
        }

        return LegacyCountryDictionary::find($region);
    }
}
