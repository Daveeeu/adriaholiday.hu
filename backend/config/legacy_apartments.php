<?php

/*
| How the legacy apartment export (storage/app/private/legacy-import/
| adriaholiday-apartments.json, read from the legacy admin's "Apartmanok"
| module and its public pages) maps onto the new site, read by
| adria:apartments:import.
*/

return [

    'file' => 'legacy-import/adriaholiday-apartments.json',

    /*
    | Legacy apartment list => apartment type (apartment_types.slug) and its
    | name, created when missing.
    */
    'types' => [
        'apartment' => ['slug' => 'italian', 'name' => 'Olasz apartmanok'],
        'greece' => ['slug' => 'greek', 'name' => 'Görög apartmanok'],
        'bulgaria' => ['slug' => 'bulgarian', 'name' => 'Bulgáriai apartmanok'],
        'montenegro' => ['slug' => 'montenegro', 'name' => 'Montenegrói apartmanok'],
    ],

    /*
    | Legacy region country => region (regions.slug).
    */
    'countries' => [
        'Olaszország' => 'italy',
        'Görögország' => 'greece',
        'Bulgária' => 'bulgaria',
        'Montenegró' => 'montenegro',
        'Horvátország' => 'croatia',
        'Ausztria' => 'austria',
    ],

    /*
    | Legacy place id => location slug, where the place is part of a location
    | the new site already has (Lignano's beaches belong to Lignano; "Sunny
    | Beach" is the site's Napospart). Every other place becomes the location
    | of its own URL name.
    */
    'places' => [
        18 => 'lignano', // Lignano Pineta
        19 => 'lignano', // Lignano Riviera
        20 => 'lignano', // Lignano Sabbiadoro
        36 => 'napospart', // Sunny Beach
    ],

    /*
    | Legacy apartment id => place id, for apartments the legacy admin keeps
    | without a place (both are Lignano apartments by their name and code).
    */
    'apartment_places' => [
        5071 => 404, // Arcobaleno apartman (600)
        5089 => 404, // Villa Gloria (632)
    ],

];
