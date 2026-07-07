<?php

namespace App\Support\Legacy;

use Illuminate\Support\Str;

/**
 * Maps the legacy adriaholiday.hu "korutazasok/csoport/korutazas/{slug}" country
 * slugs to an ISO country code, a display name and the matching (new-platform)
 * Region slug, so imported tours can be linked to `country_ids` reference options
 * and `Region` records without guessing at import time.
 */
class LegacyCountryDictionary
{
    /**
     * @var array<string, array{code: string, name: string, region_slug: ?string}>
     */
    private const COUNTRIES = [
        'albania' => ['code' => 'al', 'name' => 'Albánia', 'region_slug' => 'albania'],
        'anglia' => ['code' => 'gb', 'name' => 'Egyesült Királyság', 'region_slug' => null],
        'ausztria' => ['code' => 'at', 'name' => 'Ausztria', 'region_slug' => 'austria'],
        'belfold' => ['code' => 'hu', 'name' => 'Magyarország', 'region_slug' => null],
        'bosznia-hercegovina' => ['code' => 'ba', 'name' => 'Bosznia-Hercegovina', 'region_slug' => null],
        'csehorszag' => ['code' => 'cz', 'name' => 'Csehország', 'region_slug' => null],
        'erdely' => ['code' => 'ro', 'name' => 'Románia', 'region_slug' => 'romania'],
        'franciaorszag' => ['code' => 'fr', 'name' => 'Franciaország', 'region_slug' => 'france'],
        'gorogorszag' => ['code' => 'gr', 'name' => 'Görögország', 'region_slug' => 'greece'],
        'gruzia' => ['code' => 'ge', 'name' => 'Grúzia', 'region_slug' => null],
        'hollandia' => ['code' => 'nl', 'name' => 'Hollandia', 'region_slug' => null],
        'horvatorszag' => ['code' => 'hr', 'name' => 'Horvátország', 'region_slug' => 'croatia'],
        'lengyelorszag' => ['code' => 'pl', 'name' => 'Lengyelország', 'region_slug' => null],
        'marokko' => ['code' => 'ma', 'name' => 'Marokkó', 'region_slug' => null],
        'montenegro' => ['code' => 'me', 'name' => 'Montenegró', 'region_slug' => 'montenegro'],
        'nemetorszag' => ['code' => 'de', 'name' => 'Németország', 'region_slug' => null],
        'olaszorszag' => ['code' => 'it', 'name' => 'Olaszország', 'region_slug' => 'italy'],
        'portugalia' => ['code' => 'pt', 'name' => 'Portugália', 'region_slug' => null],
        'norvegia' => ['code' => 'no', 'name' => 'Skandinávia', 'region_slug' => null],
        'skocia' => ['code' => 'gb', 'name' => 'Egyesült Királyság', 'region_slug' => null],
        'spanyolorszag' => ['code' => 'es', 'name' => 'Spanyolország', 'region_slug' => null],
        'svajc' => ['code' => 'ch', 'name' => 'Svájc', 'region_slug' => null],
        'szlovakia' => ['code' => 'sk', 'name' => 'Szlovákia', 'region_slug' => null],
        'szlovenia' => ['code' => 'si', 'name' => 'Szlovénia', 'region_slug' => null],
        'torokorszag' => ['code' => 'tr', 'name' => 'Törökország', 'region_slug' => null],
    ];

    /**
     * @return array{code: string, name: string, region_slug: ?string}
     */
    public static function resolve(string $legacySlug, ?string $fallbackName = null): array
    {
        $normalized = Str::slug($legacySlug);

        if (isset(self::COUNTRIES[$normalized])) {
            return self::COUNTRIES[$normalized];
        }

        return [
            'code' => $normalized,
            'name' => $fallbackName ?: Str::headline($normalized),
            'region_slug' => null,
        ];
    }
}
