<?php

namespace App\Services\Tour;

use App\Models\Tour;
use App\Support\PublicContentCache;
use App\Support\TourSearchIndex;

/**
 * Destinations offered while typing in the hero search: the search keywords,
 * countries and regions of the active tours, each with the number of tours a
 * search for it finds.
 */
class TourSearchSuggestionService
{
    public const MIN_QUERY_LENGTH = 2;

    public const LIMIT = 8;

    private const CACHE_SECONDS = 900;

    /**
     * @return array<int, array{label: string, count: int}>
     */
    public function suggest(string $query): array
    {
        $normalized = TourSearchIndex::normalize($query);

        if (mb_strlen($normalized) < self::MIN_QUERY_LENGTH) {
            return [];
        }

        return collect($this->catalog())
            ->map(fn (array $entry): array => $entry + [
                'startsWith' => str_starts_with($entry['normalized'], $normalized),
            ])
            ->filter(fn (array $entry): bool => $entry['startsWith'] || str_contains(" {$entry['normalized']}", " {$normalized}"))
            ->sortBy([
                fn (array $a, array $b): int => $b['startsWith'] <=> $a['startsWith'],
                fn (array $a, array $b): int => $b['count'] <=> $a['count'],
                fn (array $a, array $b): int => strcmp($a['normalized'], $b['normalized']),
            ])
            ->take(self::LIMIT)
            ->map(fn (array $entry): array => ['label' => $entry['label'], 'count' => $entry['count']])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{label: string, normalized: string, count: int}>
     */
    private function catalog(): array
    {
        return PublicContentCache::remember(PublicContentCache::OFFERS, 'search-suggestions', self::CACHE_SECONDS, function (): array {
            $tours = Tour::query()
                ->where('active', true)
                ->with('region')
                ->get(['id', 'name', 'search_keywords', 'search_index', 'country_ids', 'region_id']);

            $labels = [];

            foreach ($tours as $tour) {
                $names = [...($tour->search_keywords ?? []), ...TourSearchIndex::countryNames($tour), TourSearchIndex::regionName($tour)];

                foreach ($names as $name) {
                    $normalized = TourSearchIndex::normalize((string) $name);

                    if ($normalized !== '') {
                        $labels[$normalized] ??= trim((string) $name);
                    }
                }
            }

            $indexes = $tours->pluck('search_index')->map(fn (?string $index): string => (string) $index);

            return collect($labels)
                ->map(function (string $label, int|string $normalized) use ($indexes): array {
                    $normalized = (string) $normalized;
                    $words = TourSearchIndex::queryWords($normalized);

                    return [
                        'label' => $label,
                        'normalized' => $normalized,
                        'count' => $indexes->filter(fn (string $index): bool => TourSearchIndex::indexMatches($index, $words))->count(),
                    ];
                })
                ->filter(fn (array $entry): bool => $entry['count'] > 0)
                ->values()
                ->all();
        });
    }
}
