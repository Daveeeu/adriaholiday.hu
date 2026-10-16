<?php

namespace App\Support\Legacy\Apartments;

/**
 * The legacy price table of an apartment ("price_table[row][column]") as the
 * apartment's pricing matrix: row 0 holds the periods' first days, row 1
 * their last days (one period per column from column 2 on); every further
 * row is an apartment type: its name (column 0), its beds ("3+2", column 1)
 * and its price per night in each period. Rows naming a type without beds or
 * prices are the legacy form's type list, not prices, and are left out.
 * Periods come in date order (the legacy admin appended late additions at
 * the end). A last day years after the first ("2024-06-29" to "2043-07-06")
 * is a typo of the year and is read in the first day's year.
 */
final class LegacyApartmentPriceTable
{
    /**
     * @param  array<int|string, mixed>  $table
     * @return array{columns: list<array{id: string, startDate: string, endDate: string}>, rows: list<array{id: string, category: string, beds: string, prices: list<string>}>}|null
     */
    public static function toPricingMatrix(array $table): ?array
    {
        $starts = self::cells($table[0] ?? []);
        $ends = self::cells($table[1] ?? []);

        $columns = collect($starts)
            ->filter(fn (string $start, int $column): bool => $column >= 2 && self::isDate($start))
            ->map(fn (string $start, int $column): array => [
                'column' => $column,
                'startDate' => $start,
                'endDate' => self::endDate($start, $ends[$column] ?? ''),
            ])
            ->sortBy([['startDate', 'asc'], ['column', 'asc']])
            ->values();

        $rows = collect($table)
            ->filter(fn (mixed $cells, int|string $row): bool => (int) $row >= 2 && is_array($cells))
            ->sortKeys(SORT_NUMERIC)
            ->map(function (array $cells, int|string $row) use ($columns): ?array {
                $cells = self::cells($cells);
                $prices = $columns->map(fn (array $column): string => $cells[$column['column']] ?? '')->all();
                $beds = $cells[1] ?? '';

                if ($beds === '' && implode('', $prices) === '') {
                    return null;
                }

                return [
                    'id' => "legacy-row-{$row}",
                    'category' => $cells[0] ?? '',
                    'beds' => $beds,
                    'prices' => $prices,
                ];
            })
            ->filter()
            ->values()
            ->all();

        if ($rows === []) {
            return null;
        }

        return [
            'columns' => $columns->map(fn (array $column): array => [
                'id' => "legacy-column-{$column['column']}",
                'startDate' => $column['startDate'],
                'endDate' => $column['endDate'],
            ])->all(),
            'rows' => $rows,
        ];
    }

    /**
     * @return array<int, string>
     */
    private static function cells(mixed $cells): array
    {
        if (! is_array($cells)) {
            return [];
        }

        $trimmed = [];

        foreach ($cells as $column => $value) {
            if (is_numeric($column) && (is_string($value) || is_numeric($value))) {
                $trimmed[(int) $column] = trim((string) $value);
            }
        }

        return $trimmed;
    }

    private static function endDate(string $start, string $end): string
    {
        if (! self::isDate($end)) {
            return $start;
        }

        if ((int) substr($end, 0, 4) - (int) substr($start, 0, 4) > 1) {
            $sameYear = substr($start, 0, 4).substr($end, 4);

            return self::isDate($sameYear) && $sameYear >= $start ? $sameYear : $start;
        }

        return $end;
    }

    private static function isDate(string $value): bool
    {
        return (bool) preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) && checkdate((int) substr($value, 5, 2), (int) substr($value, 8, 2), (int) substr($value, 0, 4));
    }
}
