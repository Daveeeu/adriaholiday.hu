<?php

/*
| The partner XML feeds the legacy adriaholiday.hu served (and travel
| portals still read): /xmltravel (Travelgate), /xmltravelmax (Travelmax),
| /xmlcesys (Cesys) and /xml. The new site serves them under the same
| addresses and in the same format (see App\Services\PartnerXml).
*/

return [

    /*
    | Tours and dates the legacy site never had are identified in the feeds
    | by this offset plus their own id, so they never clash with a legacy id.
    */
    'id_offset' => 100000,

    /*
    | Minutes a built feed is reused for (any tour change rebuilds it sooner).
    */
    'cache_minutes' => 30,

    /*
    | The legacy regions (the feeds' "country") by name => legacy id, used for
    | a tour without a legacy region of its own.
    */
    'legacy_regions' => [
        'Ausztria' => 1,
        'Olaszország' => 2,
        'Svájc' => 3,
        'Szlovénia' => 5,
        'Horvátország' => 6,
        'Franciaország' => 7,
        'Lengyelország' => 8,
        'Csehország' => 9,
        'Szlovákia' => 10,
        'Kárpátalja' => 11,
        'Erdély' => 12,
        'Montenegró' => 13,
        'Törökország' => 14,
        'Hollandia' => 15,
        'Anglia' => 16,
        'Németország' => 18,
        'Spanyolország' => 20,
        'Síutak' => 22,
        'Bulgária' => 23,
        'Nyelvtanfolyamok' => 24,
        'Diáktáborok' => 26,
        'Görögország' => 33,
        'Skócia' => 34,
        'Bosznia-Hercegovina' => 507,
        'Albánia' => 508,
        'Málta' => 509,
        'Skandinávia' => 555,
        'Baltikum' => 539,
        'Délvidék' => 540,
        'Foci EB 2024' => 541,
        '2 napos belföldi utak' => 542,
        '3 napos belföldi utak' => 543,
        '1 napos belföldi utak' => 544,
        'Határtalanul' => 548,
        'FOCI EB' => 550,
        'Belföld' => 551,
        'Portugália' => 552,
        'Grúzia' => 554,
        'Finnország' => 556,
        'Kuba' => 557,
        'Marokkó' => 558,
    ],

    /*
    | The travel types each partner knows: value => label.
    */
    'travel_types' => [
        'general' => [1 => 'Körutazás', 2 => 'Síút', 3 => 'Városlátogatás', 4 => 'Üdülés'],
        'travelgate' => [1 => 'Körutazás', 2 => 'Városlátogatás', 3 => 'Tengerpart', 4 => 'Síút'],
        'cesys' => [1 => 'Körutazás', 2 => 'Üdülés', 3 => 'Városlátogatás', 6 => 'Síutazások'],
        'travelmax' => [1 => 'Körutazás', 2 => 'Körutazás+Üdülés', 3 => '1 napos utak', 10 => 'Síút', 13 => 'Városlátogatás', 15 => 'Üdülés', 16 => 'Adventi út', 21 => 'Családbarát', 48 => 'Tengerpart'],
    ],

];
