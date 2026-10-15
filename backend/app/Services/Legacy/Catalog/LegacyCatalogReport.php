<?php

namespace App\Services\Legacy\Catalog;

use Illuminate\Support\Facades\Storage;

/**
 * Writes a catalog import report next to the application's private files
 * (storage/app/private/legacy-import): the whole report as JSON and one CSV
 * line per offer for a spreadsheet.
 */
final class LegacyCatalogReport
{
    private const DIRECTORY = 'legacy-import';

    /** The CSV columns of an offer report. */
    public const OFFER_COLUMNS = [
        'legacy_id', 'slug', 'name', 'legacy_active', 'action', 'tour_id', 'archive', 'bookings_on_tour', 'manual_review',
        'dates', 'upcoming_dates', 'bookable_upcoming_dates', 'dates_with_own_stay', 'extras', 'extras_paid_on_site',
        'departure_places', 'new_departure_places', 'gallery_images', 'media_files', 'media_mirrored', 'partner_bonuses',
        'categories', 'countries', 'unmapped', 'review_reasons',
    ];

    /**
     * @param  array<string, mixed>  $summary
     * @param  array<int, array<string, mixed>>  $rows
     * @param  array<int, string>  $columns  of the CSV
     * @return array{json: string, csv: string} absolute paths
     */
    public function write(string $name, array $summary, array $rows, array $columns = self::OFFER_COLUMNS): array
    {
        $disk = Storage::disk('local');
        $base = self::DIRECTORY.'/'.now()->format('Y-m-d_His').'-'.$name;

        $disk->put("{$base}.json", json_encode(['summary' => $summary, 'offers' => $rows], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        $disk->put("{$base}.csv", $this->csv($rows, $columns));

        return ['json' => $disk->path("{$base}.json"), 'csv' => $disk->path("{$base}.csv")];
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @param  array<int, string>  $columns
     */
    private function csv(array $rows, array $columns): string
    {
        $handle = fopen('php://temp', 'r+');
        // A BOM so spreadsheet apps read the accents as UTF-8.
        fwrite($handle, "\xEF\xBB\xBF");
        fputcsv($handle, $columns, ';');

        foreach ($rows as $row) {
            fputcsv($handle, array_map(fn (string $column): string => $this->cell($row[$column] ?? null), $columns), ';');
        }

        rewind($handle);
        $csv = (string) stream_get_contents($handle);
        fclose($handle);

        return $csv;
    }

    private function cell(mixed $value): string
    {
        return match (true) {
            is_bool($value) => $value ? 'igen' : 'nem',
            is_array($value) => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            default => (string) $value,
        };
    }
}
