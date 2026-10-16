<?php

namespace App\Support\Apartment;

/**
 * The services an apartment can offer ("Szolgáltatások"), as stored in an
 * apartment's services list, with the label shown on the public site and the
 * id the legacy admin gave them. The keys are the ones the admin form uses;
 * the labels are the legacy site's.
 */
final class ApartmentServiceCatalog
{
    /**
     * key => [label, legacy service id (none for services added on the new site), offered as a public search filter]
     *
     * @var array<string, array{0: string, 1: int|null, 2: bool}>
     */
    private const SERVICES = [
        'fürdőszoba_zuhanyzóval' => ['Fürdőszoba zuhanyzóval', 1, false],
        'fürdőszoba_zuhanykabinnal' => ['Fürdőszoba zuhanykabinnal', 2, false],
        'kis_haziallat_beviheto' => ['Kis méretű háziállat bevihető', 3, true],
        'legkondicionalo' => ['Légkondicionáló', 4, true],
        'futes' => ['Fűtés', 5, false],
        'lift' => ['Lift', 6, false],
        'fedett_parkolo' => ['Fedett parkolóhely', 7, false],
        'kulso_parkolo' => ['Külső parkolóhely', 8, false],
        'szef' => ['Széf', 9, false],
        'mikrohullamu_suto' => ['Mikrohullámú sütő', 10, false],
        'satellite_tv' => ['Szatellit TV', 11, false],
        'szabadtéri_medence' => ['Szabadtéri medence', 12, true],
        'strandszerviz' => ['Strandszerviz', 13, false],
        'kavefozo' => ['Kávéfőzőgép', 14, false],
        'blindalt_ajto' => ['Blindált ajtó', 15, false],
        'tv' => ['TV', 16, false],
        'wifi' => ['Wifi (csak a közös területeken, térítés ellenében)', 17, true],
        'kert' => ['Kert', 18, true],
        'magan_kert' => ['Magán kert', 19, false],
        'napozo_terasz' => ['Napozóterasz', 20, false],
        'ingyenes_buszjarat' => ['Ingyenes tengerparti buszjárat', 21, false],
        'gyermek_jatekok' => ['Gyermekjátékok', 22, false],
        'barbecue' => ['Barbecue', 23, false],
        'panoramas_kilatas' => ['Panorámás kilátás', 24, false],
        'husvetkor_nyitva' => ['Húsvétkor nyitva', 25, false],
        'mozgaskorlatozottaknak' => ['Mozgássérültek részére alkalmas', 26, false],
        'mosoda' => ['Mosoda', 27, false],
        'hajszarito' => ['Hajszárító', 28, false],
        'garazs' => ['Garázs', 29, false],
        'takaritas' => ['Takarítás és ágynemű térítés ellenében', 30, false],
        'bibione_termalfurdo_kedvezmeny' => ['Ingyenes medencehasználat a bibionei termálfürdőben', 31, false],
        'furdoszoba_kaddal' => ['Fürdőszoba káddal', 32, false],
        'internet_eleres' => ['Vezeték nélküli internet', 33, false],
        'egysegeben_nyitva' => ['Egész évben nyitva', 34, false],
        'etterem' => ['Étterem', 35, false],
        'animacio' => ['Animáció', 36, false],
        'bicikli_berles' => ['Kerékpárbérlés', 37, false],
        'dryer' => ['Szárítógép', 38, false],
        'jatszok' => ['Játékok gyerekeknek', 39, false],
        'animacios_program' => ['Animációs program', 40, false],
        'tengertol_valo_tavolsag' => ['Tengerközeli', 41, false],
        'reszben_felujitott' => ['Részben felújított', 42, false],
        'teljesen_felujitott' => ['Teljesen felújított', 43, false],
        'longstay' => ['Longstay – hosszú tartózkodás lehetséges', 44, false],
        'felujitott' => ['Felújított', 45, false],
        'magan_parkolo' => ['Magánparkoló', null, false],
        'tenisz' => ['Teniszpálya', null, false],
        'agynemu_terites_elleneben' => ['Ágynemű térítés ellenében', null, false],
    ];

    public static function has(string $key): bool
    {
        return isset(self::SERVICES[$key]);
    }

    public static function label(string $key): ?string
    {
        return self::SERVICES[$key][0] ?? null;
    }

    /**
     * The key of a legacy service id, if it has one.
     */
    public static function keyForLegacyId(int $legacyId): ?string
    {
        foreach (self::SERVICES as $key => [, $id]) {
            if ($id === $legacyId) {
                return $key;
            }
        }

        return null;
    }

    /**
     * Every service key, in the catalog's order.
     *
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_keys(self::SERVICES);
    }

    /**
     * The services offered as public search filters.
     *
     * @return list<array{key: string, label: string}>
     */
    public static function filters(): array
    {
        $filters = [];

        foreach (self::SERVICES as $key => [$label, , $isFilter]) {
            if ($isFilter) {
                $filters[] = ['key' => $key, 'label' => $label];
            }
        }

        return $filters;
    }

    /**
     * The given keys in the catalog's order, with labels; unknown keys are left out.
     *
     * @param  array<int, mixed>|null  $keys
     * @return list<array{key: string, label: string}>
     */
    public static function describe(?array $keys): array
    {
        $keys = array_flip(array_filter($keys ?? [], 'is_string'));
        $services = [];

        foreach (self::SERVICES as $key => [$label]) {
            if (isset($keys[$key])) {
                $services[] = ['key' => $key, 'label' => $label];
            }
        }

        return $services;
    }
}
