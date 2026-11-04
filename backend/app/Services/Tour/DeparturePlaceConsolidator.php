<?php

namespace App\Services\Tour;

use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Support\PublicContentCache;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Replaces the legacy departure places (duplicates, "miskolci indulással",
 * whole routes such as "Miskolc-Mezőkövesd-Gyöngyös-Hatvan-Budapest") with
 * one place per town, and gives every tour that has departure places the
 * office's standard route for its destination. Tours no route covers keep
 * the towns their old places named. Places no tour uses afterwards are
 * deleted.
 *
 * @phpstan-type TourRow array{id: int, name: string, route: string, before: array<int, string>, after: array<int, string>}
 */
class DeparturePlaceConsolidator
{
    private const NORTH = ['Miskolc', 'Mezőkövesd', 'Gyöngyös', 'Hatvan', 'Budapest'];

    /**
     * The office's standard departure towns by route, in boarding order.
     */
    public const ROUTES = [
        'plane' => ['Budapest'],
        'south' => [...self::NORTH, 'Székesfehérvár', 'Siófok', 'Nagykanizsa'],
        'west' => [...self::NORTH, 'Tatabánya', 'Győr', 'Mosonmagyaróvár'],
        'north' => self::NORTH,
        'miskolc' => ['Miskolc'],
        'romania' => ['Budapest', 'Miskolc'],
        'greece' => [...self::NORTH, 'Kecskemét'],
        'albania' => [...self::NORTH, 'Kecskemét', 'Kiskunfélegyháza', 'Szeged'],
        'bosnia' => [...self::NORTH, 'Dunaújváros', 'Paks', 'Szekszárd', 'Mohács'],
    ];

    /** Tours to Poland or Slovakia that depart from Miskolc only: the one-day, Advent and winter trips. */
    private const MISKOLC_ONLY_NAME = '/advent|téli|\b1 nap|dunajec/iu';

    private const SOUTH_COUNTRIES = ['it', 'hr', 'si'];

    private const WEST_COUNTRIES = ['at', 'de', 'ch', 'cz', 'nl', 'gb', 'fr', 'be'];

    /** @var array<string, TourDeparturePlace|null> */
    private array $placesByTown = [];

    /**
     * @return array{tours: array<int, TourRow>, created: array<int, string>, deleted: array<int, string>, dates: int}
     */
    public function consolidate(bool $dryRun): array
    {
        $run = function () use ($dryRun): array {
            $this->placesByTown = [];
            $places = TourDeparturePlace::query()->withCount('tours')->get();
            $towns = $this->knownTowns($places);
            $created = [];
            $rows = [];
            $dates = 0;
            $keptIds = [];

            $tours = Tour::withTrashed()
                ->whereHas('departurePlaces')
                ->with(['departurePlaces', 'dates'])
                ->orderBy('id')
                ->get();

            foreach ($tours as $tour) {
                $oldTowns = $tour->departurePlaces->mapWithKeys(fn (TourDeparturePlace $place): array => [
                    $place->id => $this->townsIn($place->name.' '.$place->city, $towns),
                ]);
                $currentTowns = $oldTowns->flatten()->unique()->values()->all();
                $route = $this->routeFor($tour, $currentTowns);
                $newTowns = $route === 'existing' ? $currentTowns : self::ROUTES[$route];

                // No route and no town recognised: the tour keeps its places for the office to fix by hand.
                if ($newTowns === []) {
                    $route = 'unchanged';
                    $newTowns = $tour->departurePlaces->pluck('name')->all();
                }

                $rows[] = [
                    'id' => $tour->id,
                    'name' => $tour->name,
                    'route' => $route,
                    'before' => $tour->departurePlaces->pluck('name')->all(),
                    'after' => $newTowns,
                ];

                if ($route === 'unchanged') {
                    array_push($keptIds, ...$tour->departurePlaces->modelKeys());

                    continue;
                }

                if ($dryRun) {
                    foreach ($newTowns as $town) {
                        $place = $this->findPlace($places, $town);

                        if ($place !== null) {
                            $keptIds[] = $place->id;
                        } elseif (! in_array($town, $created, true)) {
                            $created[] = $town;
                        }
                    }

                    continue;
                }

                $fees = $this->feesByTown($tour, $oldTowns);
                $newPlaces = collect($newTowns)->mapWithKeys(function (string $town) use ($places, &$created): array {
                    $place = $this->canonicalPlace($places, $town, $created);

                    return [$town => $place->id];
                });

                $tour->departurePlaces()->sync($newPlaces->mapWithKeys(fn (int $id, string $town): array => [
                    $id => ['fee' => $fees[$town] ?? null],
                ])->all());

                $dates += $this->remapDates($tour, $oldTowns, $newPlaces);
            }

            // On a dry run nothing was synced, so "unused" means not among the planned places.
            $deleted = $dryRun
                ? $places->whereNotIn('id', $keptIds)->sortBy('name')->pluck('name', 'id')->all()
                : TourDeparturePlace::query()->whereDoesntHave('tours')->orderBy('name')->pluck('name', 'id')->all();

            if (! $dryRun) {
                TourDeparturePlace::query()->whereKey(array_keys($deleted))->get()->each->delete();
                PublicContentCache::bump(PublicContentCache::PARTNER_XML);
            }

            return ['tours' => $rows, 'created' => $created, 'deleted' => $deleted, 'dates' => $dates];
        };

        return $dryRun ? $run() : DB::transaction($run);
    }

    /**
     * @param  array<int, string>  $currentTowns
     */
    private function routeFor(Tour $tour, array $currentTowns): string
    {
        $countries = array_map('strtolower', array_map('strval', $tour->country_ids ?? []));
        $has = fn (array $codes): bool => array_intersect($codes, $countries) !== [];
        $miskolcOnly = $currentTowns === ['Miskolc'] || preg_match(self::MISKOLC_ONLY_NAME, $tour->name) === 1;

        return match (true) {
            $tour->travel_mode_id === 'plane' => 'plane',
            $has(['al']) => 'albania',
            $has(['ba', 'me']) => 'bosnia',
            $has(['gr']) => 'greece',
            $has(['ro']) => 'romania',
            $has(['pl', 'sk']) => $miskolcOnly && ! str_contains(mb_strtolower($tour->name), 'felvidék') ? 'miskolc' : 'north',
            $has(self::SOUTH_COUNTRIES), str_contains(mb_strtolower($tour->name), 'riviér') && $has(['fr']) => 'south',
            $has(self::WEST_COUNTRIES) => 'west',
            default => 'existing',
        };
    }

    /**
     * The towns a legacy place name mentions, also in adjective form
     * ("miskolci, mezőkövesdi indulással"), in the order they appear.
     *
     * @param  array<int, string>  $towns  longest first
     * @return array<int, string>
     */
    private function townsIn(string $text, array $towns): array
    {
        $text = mb_strtolower($text);
        $found = [];

        foreach ($towns as $town) {
            $pattern = '/(?<!\p{L})'.preg_quote($this->stem($town), '/').'/u';

            if (preg_match($pattern, $text, $match, PREG_OFFSET_CAPTURE) === 1) {
                $found[$match[0][1]] = $town;
                $text = (string) preg_replace($pattern, str_repeat(' ', mb_strlen($match[0][0])), $text);
            }
        }

        ksort($found);

        return array_values($found);
    }

    /** "Nyíregyháza" → "nyíregyház", which also matches "nyíregyházi". */
    private function stem(string $town): string
    {
        $town = mb_strtolower($town);

        return mb_strlen($town) > 4 && in_array(mb_substr($town, -1), ['a', 'e'], true) ? mb_substr($town, 0, -1) : $town;
    }

    /**
     * The route towns and every existing place named after a single town.
     *
     * @param  Collection<int, TourDeparturePlace>  $places
     * @return array<int, string>
     */
    private function knownTowns(Collection $places): array
    {
        $towns = collect(self::ROUTES)->flatten()
            ->merge($places->pluck('city'))
            ->merge($places->pluck('name')->filter(fn (string $name): bool => preg_match('/^\p{Lu}\p{Ll}+$/u', $name) === 1))
            ->filter()
            ->unique()
            ->values()
            ->all();

        usort($towns, fn (string $a, string $b): int => mb_strlen($b) <=> mb_strlen($a));

        return $towns;
    }

    /**
     * @param  Collection<int, TourDeparturePlace>  $places
     */
    private function findPlace(Collection $places, string $town): ?TourDeparturePlace
    {
        return $this->placesByTown[$town] ??= $places
            ->filter(fn (TourDeparturePlace $place): bool => $place->name === $town)
            ->sortBy([['tours_count', 'desc'], ['id', 'asc']])
            ->first();
    }

    /**
     * The place of the town, created when missing. A place no tour used yet
     * (seeded or left over) starts clean: active, without a general fee.
     *
     * @param  Collection<int, TourDeparturePlace>  $places
     * @param  array<int, string>  $created
     */
    private function canonicalPlace(Collection $places, string $town, array &$created): TourDeparturePlace
    {
        $place = $this->findPlace($places, $town);

        if ($place === null) {
            $created[] = $town;
            $place = TourDeparturePlace::create(['active' => true, 'name' => $town, 'city' => $town, 'fee' => null]);
            $place->tours_count = 1;

            return $this->placesByTown[$town] = $place;
        }

        if ($place->tours_count === 0) {
            $place->update(['active' => true, 'city' => $town, 'fee' => null]);
            $place->tours_count = 1;
        }

        return $place;
    }

    /**
     * The tour's own boarding fee for each town, carried over from the old
     * places that named it (e.g. "Budapest BOK csarnok" +4 700 Ft).
     *
     * @param  Collection<int, array<int, string>>  $oldTowns
     * @return array<string, float>
     */
    private function feesByTown(Tour $tour, Collection $oldTowns): array
    {
        $fees = [];

        foreach ($tour->departurePlaces as $place) {
            if ($place->pivot->fee === null) {
                continue;
            }

            foreach ($oldTowns[$place->id] as $town) {
                $fees[$town] = max($fees[$town] ?? 0, (float) $place->pivot->fee);
            }
        }

        return $fees;
    }

    /**
     * Dates offering only some of the old places offer the same towns' new
     * places; a date left with all or none of the tour's places offers all.
     *
     * @param  Collection<int, array<int, string>>  $oldTowns
     * @param  Collection<string, int>  $newPlaces
     */
    private function remapDates(Tour $tour, Collection $oldTowns, Collection $newPlaces): int
    {
        $changed = 0;

        foreach ($tour->dates as $date) {
            if ($date->departure_place_ids === null) {
                continue;
            }

            $ids = collect($date->departure_place_ids)
                ->flatMap(fn (int|string $id): array => $oldTowns[(int) $id] ?? [])
                ->map(fn (string $town): ?int => $newPlaces[$town] ?? null)
                ->filter()
                ->unique()
                ->sort()
                ->values()
                ->all();

            $date->update(['departure_place_ids' => $ids === [] || count($ids) === $newPlaces->count() ? null : $ids]);
            $changed++;
        }

        return $changed;
    }
}
