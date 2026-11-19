<?php

namespace App\Services\Seo;

use App\Models\Location;
use App\Models\Region;
use Illuminate\Support\Str;

/**
 * The pages the countries and places of the legacy site's addresses lead to.
 * The legacy site named countries in Hungarian ("horvatorszag", "Szlovákia"),
 * while regions carry either such a slug or an English one ("croatia"), so a
 * country is matched by slug first and by its ISO code next.
 */
class LegacyCatalogPages
{
    /**
     * @var array<string, string> legacy country slug => ISO 3166-1 alpha-2 code
     */
    private const COUNTRY_CODES = [
        'albania' => 'AL',
        'ausztria' => 'AT',
        'belgium' => 'BE',
        'bosznia' => 'BA',
        'bosznia-hercegovina' => 'BA',
        'bulgaria' => 'BG',
        'csehorszag' => 'CZ',
        'dania' => 'DK',
        'erdely' => 'RO',
        'franciaorszag' => 'FR',
        'gorogorszag' => 'GR',
        'gruzia' => 'GE',
        'hollandia' => 'NL',
        'horvatorszag' => 'HR',
        'izland' => 'IS',
        'lengyelorszag' => 'PL',
        'montenegro' => 'ME',
        'nagy-britannia' => 'GB',
        'nemetorszag' => 'DE',
        'norvegia' => 'NO',
        'olaszorszag' => 'IT',
        'portugalia' => 'PT',
        'romania' => 'RO',
        'skocia' => 'GB',
        'spanyolorszag' => 'ES',
        'svajc' => 'CH',
        'szerbia' => 'RS',
        'szlovakia' => 'SK',
        'szlovenia' => 'SI',
        'torokorszag' => 'TR',
    ];

    /**
     * The apartments page of a legacy place ("pula"), or null while it has none.
     */
    public function apartmentLocationPathFor(?string $place): ?string
    {
        $slug = Str::slug(rawurldecode((string) $place));

        return $slug !== ''
            ? Location::query()->withApartmentPage()->where('slug', $slug)->first(['id', 'area_slug', 'slug'])?->apartmentPagePath()
            : null;
    }

    /**
     * The path of the active region page for a legacy country, or null when there is none.
     */
    public function regionPathFor(?string $country): ?string
    {
        $slug = Str::slug(rawurldecode((string) $country));

        if ($slug === '') {
            return null;
        }

        $region = Region::query()->where('is_active', true)->where('slug', $slug)->first(['slug']);
        $code = self::COUNTRY_CODES[$slug] ?? null;

        if ($region === null && $code !== null) {
            $region = Region::query()->where('is_active', true)->where('country_code', $code)->orderBy('sort_order')->orderBy('id')->first(['slug']);
        }

        return $region !== null ? "/regiok/{$region->slug}" : null;
    }
}
