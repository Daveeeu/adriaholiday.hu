<?php

namespace App\Http\Controllers;

use App\Services\Seo\LegacyCatalogPages;
use Illuminate\Http\RedirectResponse;

/**
 * The legacy adriaholiday.hu catalogue addresses, so links and search results
 * keep working after the switch: each leads to the page that now lists the
 * same trips, in a single permanent redirect.
 */
class LegacyCatalogRedirectController extends Controller
{
    private const TOURS_PATH = '/utazasok';

    /**
     * @var array<string, string> legacy group => category page slug
     */
    private const GROUP_CATEGORIES = [
        'korutazas' => 'korutazasok',
        'tengerparti-udulesek' => 'tengerpartok',
        'advent' => 'adventi-barangolasok',
    ];

    /**
     * Groups whose country listings ("korutazas/montenegro") lead to the
     * country's region page: it lists those trips. An advent listing stays on
     * the advent category, which matches what it was searched for.
     */
    private const GROUPS_BY_COUNTRY = ['korutazas', 'tengerparti-udulesek'];

    /**
     * @var array<string, string> legacy region listing that was a theme => category page slug
     */
    private const THEME_CATEGORIES = [
        'havas-kalandok' => 'havas-kalandok',
        'repulos-utak' => 'repulos-korutazasok',
    ];

    public function __construct(private readonly LegacyCatalogPages $pages) {}

    /**
     * "/korutazasok/csoport/{group}/{country?}": a trip group, optionally of one
     * country (any further segment of the legacy address is ignored).
     */
    public function group(string $group, ?string $country = null): RedirectResponse
    {
        $country = explode('/', (string) $country)[0];
        $regionPath = in_array($group, self::GROUPS_BY_COUNTRY, true) ? $this->pages->regionPathFor($country) : null;
        $categoryPath = isset(self::GROUP_CATEGORIES[$group]) ? '/kategoriak/'.self::GROUP_CATEGORIES[$group] : null;

        return $this->moved($regionPath ?? $categoryPath ?? self::TOURS_PATH);
    }

    /**
     * "/korutazasok/regio/{region}": a country's trips, or a theme listed among the regions.
     */
    public function region(string $region): RedirectResponse
    {
        $themePath = isset(self::THEME_CATEGORIES[$region]) ? '/kategoriak/'.self::THEME_CATEGORIES[$region] : null;

        return $this->moved($themePath ?? $this->pages->regionPathFor($region) ?? self::TOURS_PATH);
    }

    /**
     * "/egyeni-szallasfoglalas/{country}/{place?}": the legacy individual
     * accommodation pages (Pula, Rovinj, …) lead to the place's apartments,
     * otherwise to their country's trips.
     */
    public function accommodation(string $country, ?string $place = null): RedirectResponse
    {
        $place = explode('/', (string) $place)[0];

        return $this->moved($this->pages->apartmentLocationPathFor($place) ?? $this->pages->regionPathFor($country) ?? self::TOURS_PATH);
    }

    private function moved(string $path): RedirectResponse
    {
        return redirect($path, 301);
    }
}
