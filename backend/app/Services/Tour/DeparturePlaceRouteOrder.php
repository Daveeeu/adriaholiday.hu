<?php

namespace App\Services\Tour;

use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Support\PublicContentCache;
use Illuminate\Support\Facades\DB;

/**
 * Puts each tour's departure places in the boarding order of the office's
 * route: the shortest standard route holding all of them. Which places a
 * tour offers does not change; a tour with a town on no route keeps its
 * order and is reported.
 *
 * @phpstan-type RouteOrderRow array{id: int, name: string, active: bool, before: array<int, string>, after: array<int, string>}
 */
class DeparturePlaceRouteOrder
{
    /**
     * @return array{changed: array<int, RouteOrderRow>, unchanged: int, unmatched: array<int, RouteOrderRow>}
     */
    public function apply(bool $dryRun): array
    {
        $result = ['changed' => [], 'unchanged' => 0, 'unmatched' => []];

        $tours = Tour::query()->has('departurePlaces', '>=', 2)->with('departurePlaces')->orderBy('id')->get();

        DB::transaction(function () use ($tours, $dryRun, &$result): void {
            foreach ($tours as $tour) {
                $before = $tour->departurePlaces->pluck('name')->all();
                $route = $this->routeOf($before);
                $row = ['id' => $tour->id, 'name' => (string) $tour->name, 'active' => (bool) $tour->active, 'before' => $before, 'after' => $route ?? $before];

                if ($route === null) {
                    $result['unmatched'][] = $row;
                } else {
                    $after = array_values(array_intersect($route, $before));
                    $row['after'] = $after;

                    if ($after === $before && $tour->departurePlaces->every(fn (TourDeparturePlace $place): bool => $place->pivot->sort_order > 0)) {
                        $result['unchanged']++;

                        continue;
                    }

                    $result['changed'][] = $row;

                    if (! $dryRun) {
                        foreach ($tour->departurePlaces as $place) {
                            $tour->departurePlaces()->updateExistingPivot($place->id, ['sort_order' => array_search($place->name, $after, true) + 1]);
                        }
                    }
                }
            }
        });

        if (! $dryRun) {
            PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PARTNER_XML);
        }

        return $result;
    }

    /**
     * The shortest route holding every town, or null when none does.
     *
     * @param  array<int, string>  $towns
     * @return array<int, string>|null
     */
    private function routeOf(array $towns): ?array
    {
        return collect(DeparturePlaceConsolidator::ROUTES)
            ->filter(fn (array $route): bool => array_diff($towns, $route) === [])
            ->sortBy(fn (array $route): int => count($route))
            ->first();
    }
}
