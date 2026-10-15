<?php

/*
| How the legacy offer catalog (legacy-export/adriaholiday-all-offers.json)
| maps onto the new site, read by adria:catalog:import.
|
| Only unambiguous matches are listed with a target; a name mapped to null
| (or missing) is not linked to anything and is reported as unmapped. Every
| legacy name stays in the tour's legacy_attributes either way.
*/

return [

    /*
    | Legacy offers kept archived (soft deleted) and inactive, e.g. test records.
    */
    'archived_legacy_ids' => [
        1155, // "a:b", a test offer
    ],

    /*
    | Legacy offers kept off the site's offer lists, live only on their own
    | page: the school trips the legacy site listed nowhere (office decision,
    | 2026-10-15; see legacy-export/legacy-site-status.json).
    */
    'unlisted_legacy_ids' => [
        796, 800, 809, 810, 953, 956, 971, 973, 975, 976, 977, 978,
        979, 980, 983, 984, 986, 987, 988, 989, 990, 991, 992,
    ],

    /*
    | Legacy offer group ("Ajánlatcsoport") => portfolio category name. The
    | legacy seasonal groups are the same list, so they map the same way.
    */
    'offer_groups' => [
        'Körutazás' => 'Körutazások',
        'Tengerparti üdülések' => 'Tengerpartok',
        'Adventi ajánlatok' => 'Adventi barangolások',
        'Osztálykirándulás' => 'Osztálykirándulások',
        'Síutak' => null,
        'Partner ajánlat' => null,
        'Karnevál' => null,
        'Csoportok részére' => null,
        'AKCIÓS Utazások' => null,
        'Foglalj 0 % előleggel' => null,
        'Kiemelt ajánlatok' => null,
        'Kora nyári ajánlatok' => null,
    ],

    /*
    | Legacy region group (the "Csoport" type regions) => portfolio category
    | name. The new site's region groups are resort groups ("Horvát riviéra"),
    | a different thing, so these never become one.
    */
    'region_groups' => [
        'Osztálykirándulás' => 'Osztálykirándulások',
        'Tengerparti üdülések' => 'Tengerpartok',
        'Tengerparti ajánlataink autóbusszal' => 'Tengerpartok',
        'Advent' => 'Adventi barangolások',
        'Belföldi advent' => 'Adventi barangolások',
        'Repülős utak' => 'Repülős körutazások',
        'Nyári táborok' => null,
        'Foglalj 0 % előleggel' => null,
        'Velencei karnevál' => null,
        'Pünkösdi hosszú hétvége' => null,
        'Május 1. hosszú hétvége' => null,
        'Húsvéti programjaink' => null,
        'Különlegességek' => null,
        'Balkán vidékek' => null,
        'Tavaszi ajánlataink' => null,
        'lélegzetelállító tájakon' => null,
        'tavaszi 10 napos akció' => null,
        'őszi ajánlataink' => null,
        'augusztus 20. hosszú hétvége' => null,
        'őszi szünet' => null,
        'Pár napos szomszédolások' => null,
        'TOP 5 program' => null,
        'Nyárindító ajánlatok' => null,
        'Havas kalandok' => null,
    ],

    /*
    | Legacy region (the "Régió" type) => legacy country slug of
    | LegacyCountryDictionary, for regions whose own name is not one. Regions
    | named after a country ("Ausztria") resolve by their name.
    */
    'regions' => [
        '1 napos belföldi utak' => 'belfold',
        '2 napos belföldi utak' => 'belfold',
        '3 napos belföldi utak' => 'belfold',
        'Délvidék' => null,
        'Baltikum' => null,
        'Síutak' => null,
        'Nyelvtanfolyamok' => null,
        'Diáktáborok' => null,
        'Foci EB 2024' => null,
        'FOCI EB' => null,
        'Határtalanul' => null,
    ],

    /*
    | Per offer, approved by the office (docs/legacy-catalog-taxonomy-proposal.md):
    | countries (LegacyCountryDictionary slugs) and categories added to what the
    | legacy groups and regions give, for offers the legacy admin left without.
    */
    'offers' => [
        796 => ['countries' => ['erdely']],
        799 => ['countries' => ['szerbia']],
        800 => ['countries' => ['karpatalja']],
        854 => ['countries' => ['szlovenia']],
        876 => ['countries' => ['torokorszag', 'bulgaria']],
        890 => ['countries' => ['szlovakia'], 'categories' => ['Körutazások']],
        945 => ['countries' => ['horvatorszag']],
        950 => ['countries' => ['belfold'], 'categories' => ['Körutazások']],
        954 => ['countries' => ['belfold']],
        970 => ['countries' => ['belfold']],
        1012 => ['countries' => ['szlovakia'], 'categories' => ['Körutazások']],
        1087 => ['countries' => ['albania'], 'categories' => ['Tengerpartok']],
        1139 => ['countries' => ['gruzia']],
        1184 => ['countries' => ['anglia'], 'categories' => ['Körutazások']],
        1198 => ['countries' => ['ausztria'], 'categories' => ['Adventi barangolások']],
    ],

];
