<?php

namespace App\Services\Tour;

use App\Models\Tour;
use App\Models\TourDate;
use Illuminate\Support\Collection;

/**
 * Picks the offers the trip page shows under "Ezek is érdekelhetnek": the
 * listed tours most like the one being viewed and, when the visitor allowed
 * personalised offers, like the ones they looked at before — the two lists
 * take turns (two, then one, and so on), so the page's first three cards
 * always include one picked for the visitor's interests. Tours are alike in
 * their categories and countries above all, then in region, travel mode,
 * length and price. Tours the visitor has already seen rank lower, and tours
 * without an upcoming date (only a quote can be asked for) lower still.
 */
class RelatedTourRecommender
{
    /** Each earlier view counts this much less than the one after it. */
    private const HISTORY_DECAY = 0.8;

    /** Which list each place takes from: the viewed tour's or the visitor's history's. */
    private const TURNS = ['current', 'current', 'history'];

    private const WEIGHTS = [
        'categories' => 3.0,
        'countries' => 3.0,
        'region' => 1.0,
        'travelMode' => 1.0,
        'length' => 1.0,
        'price' => 1.0,
    ];

    private const SEEN_FACTOR = 0.5;

    private const NO_DATE_FACTOR = 0.6;

    /**
     * @param  array<int, string>  $viewedSlugs  the visitor's earlier views, most recent first
     * @return Collection<int, Tour> with their region, upcoming dates and media loaded
     */
    public function recommend(Tour $tour, array $viewedSlugs, int $limit): Collection
    {
        $candidates = Tour::query()
            ->listedPublicly()
            ->whereKeyNot($tour->getKey())
            ->with(['region', 'dates' => fn ($query) => $query->upcoming(), 'media', 'galleryItems.media'])
            ->get();

        $viewed = $this->viewedTours($tour, $viewedSlugs);
        $seenIds = $viewed->map(fn (Tour $viewedTour): int => $viewedTour->getKey())->all();
        $rankings = [
            'current' => $this->rank($candidates, [[$this->features($tour->loadMissing(['dates' => fn ($query) => $query->upcoming()])), 1.0]], $seenIds),
            'history' => $viewed->isEmpty() ? [] : $this->rank($candidates, $viewed->values()->map(
                fn (Tour $viewedTour, int $index): array => [$this->features($viewedTour), self::HISTORY_DECAY ** $index],
            )->all(), $seenIds),
        ];

        $picked = [];

        for ($turn = 0; count($picked) < min($limit, $candidates->count()); $turn++) {
            $list = $rankings['history'] === [] ? 'current' : self::TURNS[$turn % count(self::TURNS)];

            while (($next = array_shift($rankings[$list])) !== null && isset($picked[$next->getKey()])) {
                // Already picked from the other list.
            }

            if ($next !== null) {
                $picked[$next->getKey()] = $next;
            }
        }

        return collect(array_values($picked));
    }

    /**
     * The candidates from most to least alike the profile; on a tie featured
     * tours first, then the admin's order.
     *
     * @param  Collection<int, Tour>  $candidates
     * @param  array<int, array{0: array<string, mixed>, 1: float}>  $profile  features and weight of each tour looked at
     * @param  array<int, int>  $seenIds
     * @return array<int, Tour>
     */
    private function rank(Collection $candidates, array $profile, array $seenIds): array
    {
        return $candidates
            ->map(fn (Tour $candidate): array => [$candidate, $this->score($candidate, $profile, $seenIds)])
            ->sort(fn (array $a, array $b): int => [$b[1], $b[0]->featured, $a[0]->sort_order] <=> [$a[1], $a[0]->featured, $b[0]->sort_order])
            ->map(fn (array $scored): Tour => $scored[0])
            ->values()
            ->all();
    }

    /**
     * @param  array<int, string>  $slugs
     * @return Collection<int, Tour> in the order given
     */
    private function viewedTours(Tour $tour, array $slugs): Collection
    {
        $slugs = array_values(array_diff($slugs, [$tour->seo_name]));

        if ($slugs === []) {
            return collect();
        }

        $tours = Tour::query()
            ->where('active', true)
            ->whereIn('seo_name', $slugs)
            ->with(['dates' => fn ($query) => $query->upcoming()])
            ->get()
            ->keyBy('seo_name');

        return collect($slugs)->map(fn (string $slug): ?Tour => $tours->get($slug))->filter()->values();
    }

    /**
     * @param  array<int, array{0: array<string, mixed>, 1: float}>  $profile  features and weight of each tour the visitor looked at
     * @param  array<int, int>  $seenIds
     */
    private function score(Tour $candidate, array $profile, array $seenIds): float
    {
        $features = $this->features($candidate);
        $score = 0.0;

        foreach ($profile as [$viewed, $weight]) {
            $score += $weight * $this->similarity($viewed, $features);
        }

        if (in_array($candidate->getKey(), $seenIds, true)) {
            $score *= self::SEEN_FACTOR;
        }

        return $candidate->dates->isEmpty() ? $score * self::NO_DATE_FACTOR : $score;
    }

    /**
     * @param  array<string, mixed>  $a
     * @param  array<string, mixed>  $b
     */
    private function similarity(array $a, array $b): float
    {
        return self::WEIGHTS['categories'] * self::overlap($a['categories'], $b['categories'])
            + self::WEIGHTS['countries'] * self::overlap($a['countries'], $b['countries'])
            + self::WEIGHTS['region'] * (int) ($a['region'] !== null && $a['region'] === $b['region'])
            + self::WEIGHTS['travelMode'] * (int) ($a['travelMode'] !== null && $a['travelMode'] === $b['travelMode'])
            + self::WEIGHTS['length'] * self::closeness($a['days'], $b['days'])
            + self::WEIGHTS['price'] * self::closeness($a['price'], $b['price']);
    }

    /**
     * @return array{categories: array<int, string>, countries: array<int, string>, region: int|null, travelMode: int|null, days: float|null, price: float|null}
     */
    private function features(Tour $tour): array
    {
        $date = $tour->dates->sortBy('start_date')->first();
        $prices = $tour->dates->pluck('price_box_price')->filter()->map(fn ($price): float => (float) $price);

        return [
            'categories' => array_map('strval', $tour->category_ids ?? []),
            'countries' => array_map('strval', $tour->country_ids ?? []),
            'region' => $tour->region_id,
            'travelMode' => $tour->travel_mode_id,
            'days' => $date instanceof TourDate && $date->start_date && $date->end_date
                ? (float) $date->start_date->diffInDays($date->end_date) + 1
                : null,
            'price' => $prices->isNotEmpty() ? $prices->min() : ($tour->price_box_price !== null ? (float) $tour->price_box_price : null),
        ];
    }

    /**
     * Jaccard index: the share of the two sets' values they have in common.
     *
     * @param  array<int, string>  $a
     * @param  array<int, string>  $b
     */
    private static function overlap(array $a, array $b): float
    {
        $union = count(array_unique([...$a, ...$b]));

        return $union === 0 ? 0.0 : count(array_intersect(array_unique($a), array_unique($b))) / $union;
    }

    /**
     * 1 for equal values, falling to 0 as one becomes twice the other; 0 when either is unknown.
     */
    private static function closeness(?float $a, ?float $b): float
    {
        if ($a === null || $b === null || $a <= 0 || $b <= 0) {
            return 0.0;
        }

        return max(0.0, 1 - abs(log($a / $b)) / log(2));
    }
}
