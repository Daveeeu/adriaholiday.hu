<?php

namespace App\Support\Apartment;

use Carbon\CarbonInterface;

/**
 * The part of an apartment's pricing matrix a guest can still book: the
 * periods that have not ended yet, and the apartment types with a price in
 * any of them. Prices are per apartment per night, in euros.
 */
final class ApartmentPriceTable
{
    /**
     * @param  array<string, mixed>|null  $matrix  {columns: [{startDate, endDate}], rows: [{category, beds, prices}]}
     * @return array{periods: list<array{startDate: string, endDate: string}>, rows: list<array{category: string, beds: string, maxGuests: int|null, prices: list<float|null>}>}
     */
    public static function upcoming(?array $matrix, CarbonInterface $today): array
    {
        $columns = is_array($matrix['columns'] ?? null) ? array_values($matrix['columns']) : [];
        $rows = is_array($matrix['rows'] ?? null) ? array_values($matrix['rows']) : [];
        $todayString = $today->toDateString();

        $periods = [];

        foreach ($columns as $index => $column) {
            $start = is_array($column) ? (string) ($column['startDate'] ?? '') : '';
            $end = is_array($column) ? (string) ($column['endDate'] ?? '') : '';

            if ($start !== '' && ($end !== '' ? $end : $start) >= $todayString) {
                $periods[$index] = ['startDate' => $start, 'endDate' => $end !== '' ? $end : $start];
            }
        }

        $priced = [];

        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $prices = array_map(fn (int $index): ?float => self::price($row['prices'][$index] ?? null), array_keys($periods));

            if (array_filter($prices, fn (?float $price): bool => $price !== null) === []) {
                continue;
            }

            $priced[] = [
                'category' => trim((string) ($row['category'] ?? '')),
                'beds' => trim((string) ($row['beds'] ?? '')),
                'maxGuests' => self::guests((string) ($row['beds'] ?? '')),
                'prices' => $prices,
            ];
        }

        return [
            'periods' => $priced === [] ? [] : array_values($periods),
            'rows' => $priced,
        ];
    }

    /**
     * The lowest price per night of the periods that have not ended yet.
     *
     * @param  array<string, mixed>|null  $matrix
     */
    public static function lowestUpcomingPrice(?array $matrix, CarbonInterface $today): ?float
    {
        $prices = collect(self::upcoming($matrix, $today)['rows'])->flatMap(fn (array $row): array => $row['prices'])->filter();

        return $prices->isEmpty() ? null : (float) $prices->min();
    }

    /**
     * The apartment types of the matrix (its row names), each once, in order.
     *
     * @param  array<string, mixed>|null  $matrix
     * @return list<string>
     */
    public static function categories(?array $matrix): array
    {
        $rows = is_array($matrix['rows'] ?? null) ? $matrix['rows'] : [];

        return collect($rows)
            ->map(fn (mixed $row): string => is_array($row) ? trim((string) ($row['category'] ?? '')) : '')
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    /**
     * The most guests any apartment type of the matrix sleeps ("3+2" sleeps 5).
     *
     * @param  array<string, mixed>|null  $matrix
     */
    public static function maxGuests(?array $matrix): ?int
    {
        $rows = is_array($matrix['rows'] ?? null) ? $matrix['rows'] : [];

        $guests = collect($rows)
            ->map(fn (mixed $row): ?int => is_array($row) ? self::guests((string) ($row['beds'] ?? '')) : null)
            ->filter();

        return $guests->isEmpty() ? null : (int) $guests->max();
    }

    /**
     * Guests of a beds value: "3+2" (3 beds and 2 extra beds) sleeps 5, "4" sleeps 4.
     */
    public static function guests(string $beds): ?int
    {
        if (! preg_match_all('/\d+/', $beds, $matches)) {
            return null;
        }

        $guests = array_sum(array_map('intval', $matches[0]));

        return $guests > 0 && $guests <= 50 ? $guests : null;
    }

    private static function price(mixed $value): ?float
    {
        $value = str_replace([' ', ','], ['', '.'], trim((string) $value));

        return is_numeric($value) && (float) $value > 0 ? (float) $value : null;
    }
}
