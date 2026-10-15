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
     * @param  array{offer_groups: array<int, string>, regions: array<int, string>, region_groups: array<int, string>}  $taxonomy
     * @return array{categories: array<int, string>, countries: array<int, array{code: string, name: string, region_slug: ?string}>, unmapped: array{offer_groups: array<int, string>, regions: array<int, string>, region_groups: array<int, string>}}
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

        return [
            'categories' => array_values(array_unique([...$offerGroupCategories, ...$regionGroupCategories])),
            'countries' => array_values($countries),
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
