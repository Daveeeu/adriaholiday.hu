<?php

namespace App\Support\Tour;

use Illuminate\Support\Str;

/**
 * The fixed order the supplements of a tour date are listed in, on the site
 * and on every booking document, whatever order they were entered in: the
 * local tax right under the participation fee, then meals, entrance tickets,
 * flights, luggage, and the rest. Insurances always come last, apart.
 */
final class TourExtraOrder
{
    /**
     * Name fragments of each group, in listing order; matched without accents and case.
     *
     * @var array<int, array<int, string>>
     */
    private const GROUPS = [
        ['udulohelyi', 'idegenforgalmi', 'kurtaxe', 'city tax', 'tourist tax'],
        ['vacsora', 'ebed', 'reggeli', 'felpanzio', 'ellatas', 'all inclusive'],
        ['belepo'],
        ['repulo', 'repter', 'kerozin'],
        ['poggyasz', 'csomag', 'borond'],
    ];

    /** The group a supplement's name falls in; the rest come after every group. */
    public static function rank(string $name): int
    {
        $normalized = Str::lower(Str::ascii($name));

        foreach (self::GROUPS as $rank => $fragments) {
            if (Str::contains($normalized, $fragments)) {
                return $rank;
            }
        }

        return count(self::GROUPS);
    }

    /**
     * The items in the fixed order; items of one group keep the order they came in.
     *
     * @template T
     *
     * @param  array<int, T>  $items
     * @param  callable(T): string  $nameOf
     * @return array<int, T>
     */
    public static function sort(array $items, callable $nameOf): array
    {
        $positioned = array_map(fn ($item, int $position): array => [self::rank($nameOf($item)), $position, $item], $items, array_keys(array_values($items)));

        usort($positioned, fn (array $a, array $b): int => [$a[0], $a[1]] <=> [$b[0], $b[1]]);

        return array_column($positioned, 2);
    }
}
