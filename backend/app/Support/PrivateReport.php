<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Writes a command's report next to the application's private files
 * (storage/app/private/<directory>): the whole report as JSON and one CSV
 * line per row for a spreadsheet.
 */
final class PrivateReport
{
    /**
     * @param  array<string, mixed>  $summary
     * @param  array<int, array<string, mixed>>  $rows
     * @param  array<int, string>  $columns  of the CSV
     * @param  string  $rowsKey  the rows' key in the JSON report
     * @param  array<string, mixed>  $extra  more top-level keys of the JSON report only
     * @return array{json: string, csv: string} absolute paths
     */
    public function write(string $directory, string $name, array $summary, array $rows, array $columns, string $rowsKey, array $extra = []): array
    {
        $disk = Storage::disk('local');
        $base = $directory.'/'.now()->format('Y-m-d_His').'-'.$name;

        // A second report within the same second must not overwrite the first.
        for ($suffix = 2; $disk->exists("{$base}.json"); $suffix++) {
            $base = (string) preg_replace('/(-\d+)?$/', "-{$suffix}", $base, 1);
        }
        $report = ['summary' => $summary, $rowsKey => $rows, ...$extra];

        $disk->put("{$base}.json", json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
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
