<?php

namespace App\Services\Legacy;

use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use App\Support\Tour\TourExtraChargeRule;
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

    /**
     * The place of a legacy boarding point: the one linked to its legacy id,
     * else the place of the same name (linked to it unless it already belongs
     * to another legacy boarding point of that name), else a new place.
     * Places are shared by every tour and are never removed here.
     */
    public function legacyDeparturePlaceId(int $legacyId, string $name, ?string $city = null): int
    {
        $place = $this->findLegacyDeparturePlace($legacyId, $name);

        if ($place === null) {
            $place = TourDeparturePlace::query()->create(['name' => trim($name), 'city' => $city, 'active' => true]);
        }

        if ($place->legacy_id === null && ! TourDeparturePlace::query()->where('legacy_id', $legacyId)->exists()) {
            $place->forceFill(['legacy_id' => $legacyId])->save();
        }

        return $place->id;
    }

    public function findLegacyDeparturePlace(int $legacyId, string $name): ?TourDeparturePlace
    {
        return TourDeparturePlace::query()->where('legacy_id', $legacyId)->first()
            ?? TourDeparturePlace::query()->where('name', trim($name))->orderByRaw('legacy_id is null desc')->orderBy('id')->first();
    }

    /**
     * The alone / roommate choices the legacy site offers with every single
     * room supplement (its admin export lists the supplement without them).
     *
     * @return array<int, string>
     */
    public function singleRoomChoices(): array
    {
        return TourDateExtra::query()
            ->where('charge_rule', TourExtraChargeRule::SOLO_TRAVELLER)
            ->whereNotNull('choices')
            ->pluck('choices')
            ->countBy(fn (array $choices): string => json_encode($choices))
            ->sortDesc()
            ->keys()
            ->map(fn (string $choices): array => json_decode($choices, true))
            ->first() ?? [];
    }
}
