<?php

namespace App\Services\Legacy\Apartments;

use App\Models\Location;
use App\Models\Region;
use App\Support\Legacy\Apartments\LegacyApartmentExport;
use App\Support\Legacy\Apartments\LegacyApartmentExportException;
use App\Support\Legacy\Apartments\LegacyApartmentHtml;
use App\Support\Legacy\LegacyText;
use Illuminate\Support\Str;

/**
 * The location of a legacy place ("Bibione"): the site's location of the
 * same URL name (or the one config/legacy_apartments.php names for it),
 * created when missing. A place that is its location's own (not one mapped
 * onto another, like Lignano's beaches) also gives it what the legacy
 * location page showed: the area of its URL (/apartmanok/veneto/bibione),
 * the introduction above and the guide under the apartment list, the
 * information block of its apartments' pages and the SEO fields.
 */
final class LegacyApartmentLocationResolver
{
    /** @var array<int, Location> by legacy place id */
    private array $resolved = [];

    /**
     * The location a legacy place maps to, without writing anything (null when it does not exist yet).
     */
    public function find(int $placeId, LegacyApartmentExport $export): ?Location
    {
        return Location::query()->where('legacy_id', $placeId)->first()
            ?? Location::query()->where('slug', $this->slug($placeId, $export))->first();
    }

    /**
     * @param  array{0: float|null, 1: float|null}  $coordinates  of one of its apartments, for a new location
     *
     * @throws LegacyApartmentExportException
     */
    public function resolve(int $placeId, LegacyApartmentExport $export, array $coordinates): Location
    {
        if (isset($this->resolved[$placeId])) {
            return $this->resolved[$placeId];
        }

        $place = $export->place($placeId) ?? throw new LegacyApartmentExportException("Legacy place {$placeId} is missing from the export.");
        $region = $export->region(is_numeric($place['location_id'] ?? null) ? (int) $place['location_id'] : null);
        $ownPlace = ! array_key_exists($placeId, (array) config('legacy_apartments.places'));
        $location = $this->find($placeId, $export) ?? $this->create($placeId, $place, $region, $export, $coordinates);

        if ($ownPlace) {
            $location->fill([
                'legacy_id' => $placeId,
                'area_slug' => $this->line($region['seo_name'] ?? null),
                'area_name' => $this->line($region['city_hu'] ?? null) ?? $this->line($region['city'] ?? null),
                'description' => LegacyApartmentHtml::prepare($place['description'] ?? null),
                'guide' => LegacyApartmentHtml::prepare($place['description_bottom'] ?? null),
                'apartment_information' => LegacyApartmentHtml::prepare($region['apartments_information'] ?? null),
                'seo_title' => $this->line($place['seo[title]'] ?? null),
                'seo_description' => $this->line($place['seo[description]'] ?? null),
                'seo_robots' => $this->line($place['seo[robots]'] ?? null),
            ])->save();
        }

        return $this->resolved[$placeId] = $location;
    }

    private function slug(int $placeId, LegacyApartmentExport $export): string
    {
        $mapped = config("legacy_apartments.places.{$placeId}");

        if (is_string($mapped)) {
            return $mapped;
        }

        $place = $export->place($placeId) ?? [];

        return $this->line($place['seo_name'] ?? null) ?? Str::slug((string) ($place['name'] ?? "hely-{$placeId}"));
    }

    /**
     * @param  array<string, mixed>  $place
     * @param  array<string, mixed>|null  $region
     * @param  array{0: float|null, 1: float|null}  $coordinates
     *
     * @throws LegacyApartmentExportException
     */
    private function create(int $placeId, array $place, ?array $region, LegacyApartmentExport $export, array $coordinates): Location
    {
        $country = (string) ($region['country'] ?? '');
        $regionSlug = config("legacy_apartments.countries.{$country}");
        $siteRegion = is_string($regionSlug) ? Region::query()->where('slug', $regionSlug)->first() : null;

        if ($siteRegion === null) {
            throw new LegacyApartmentExportException("No site region for the country \"{$country}\" of legacy place {$placeId}.");
        }

        return Location::query()->create([
            'region_id' => $siteRegion->id,
            'slug' => $this->slug($placeId, $export),
            'name' => LegacyText::line($place['name'] ?? null) ?? "Hely {$placeId}",
            'type' => 'coastal_town',
            'latitude' => $coordinates[0] ?? 0,
            'longitude' => $coordinates[1] ?? 0,
            // Shown once it has a published apartment; the import publishes only the legacy site's listed ones.
            'is_active' => true,
        ]);
    }

    private function line(mixed $value): ?string
    {
        return is_string($value) ? LegacyText::line($value) : null;
    }
}
