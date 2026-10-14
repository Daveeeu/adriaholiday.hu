<?php

namespace App\Services\Legacy;

use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use Illuminate\Support\Str;

/**
 * Finds (or creates) the reference records legacy imports point a tour to:
 * the travel mode option and departure places, matched by name.
 */
class LegacyReferenceResolver
{
    private const TRAVEL_MODE_NAMES = ['bus' => 'Busz', 'plane' => 'Repülő', 'train' => 'Vonat'];

    public function travelMode(string $code): string
    {
        TourReferenceOption::query()->firstOrCreate(
            ['type' => 'travel-mode', 'code' => $code],
            ['name' => self::TRAVEL_MODE_NAMES[$code] ?? Str::headline($code), 'active' => true, 'sort_order' => 0],
        );

        return $code;
    }

    /**
     * @param  array<int, string>  $names
     * @return array<string, int> departure place id keyed by name
     */
    public function departurePlaceIds(array $names): array
    {
        $ids = [];

        foreach ($names as $name) {
            $name = trim($name);

            if ($name !== '') {
                $ids[$name] = TourDeparturePlace::query()->firstOrCreate(['name' => $name], ['active' => true])->id;
            }
        }

        return $ids;
    }
}
