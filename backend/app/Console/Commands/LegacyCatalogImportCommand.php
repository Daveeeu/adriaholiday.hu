<?php

namespace App\Console\Commands;

use App\Services\Legacy\Catalog\LegacyCatalogImportService;
use App\Services\Legacy\Catalog\LegacyCatalogReader;
use App\Services\Legacy\Catalog\LegacyCatalogReport;
use App\Support\Legacy\Catalog\LegacyCatalogException;
use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;

class LegacyCatalogImportCommand extends Command
{
    use ConfirmableTrait;

    protected $signature = 'adria:catalog:import
        {file : The legacy catalog export (adriaholiday-all-offers.json)}
        {--dry-run : Only report what would happen; nothing is written}
        {--only=* : Only the offers with these legacy ids (repeatable); orphan tours are then left alone}
        {--reimport-unchanged : Also re-import offers whose legacy data did not change since their import}
        {--force : Run in production without asking}';

    protected $description = 'Import the legacy offer catalog: every offer becomes a tour (existing tours are updated in place, so bookings keep their tour and date). Back up the database and run adria:catalog:media first.';

    public function handle(LegacyCatalogReader $reader, LegacyCatalogImportService $imports, LegacyCatalogReport $report): int
    {
        try {
            $catalog = $reader->read((string) $this->argument('file'));
        } catch (LegacyCatalogException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $only = array_map('intval', (array) $this->option('only'));
        $prepared = $imports->prepare($catalog, $only);

        foreach ($prepared['catalog_errors'] as $error) {
            $this->error($error);
        }

        if ($prepared['catalog_errors'] !== []) {
            return self::FAILURE;
        }

        $rows = $imports->reportRows($prepared);
        $summary = $this->summary($catalog->path, $catalog->sha256, $rows, $prepared['orphans']);
        $this->printSummary($summary);

        if ($this->option('dry-run')) {
            $paths = $report->write('import-dry-run', $summary, $rows);
            $this->info("Dry run, nothing was written. Report: {$paths['json']} and {$paths['csv']}");

            return self::SUCCESS;
        }

        if (! $this->confirmToProceed('This imports the legacy catalog into the database.')) {
            return self::FAILURE;
        }

        $run = $imports->import(
            $catalog,
            $prepared,
            (bool) $this->option('reimport-unchanged'),
            wholeCatalog: $only === [],
            progress: fn (int $legacyId, string $outcome, string $message) => $this->line(sprintf('[%s] %d %s', strtoupper($outcome), $legacyId, $message)),
        );
        $paths = $report->write("import-run-{$run->id}", [...$summary, 'run' => $run->only(['id', 'status', 'summary'])], $rows);

        $this->table(['Outcome', 'Offers'], collect($run->summary['outcomes'] ?? [])->map(fn (int $count, string $outcome): array => [$outcome, $count])->values()->all());
        $this->info(sprintf('Run #%d %s. Report: %s', $run->id, $run->status, $paths['json']));
        $this->info('Next: php artisan adria:catalog:verify '.$catalog->path);

        return ($run->summary['failed_legacy_ids'] ?? []) === [] ? self::SUCCESS : self::FAILURE;
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @param  array<int, array<string, mixed>>  $orphans
     * @return array<string, mixed>
     */
    private function summary(string $path, string $sha256, array $rows, array $orphans): array
    {
        $offers = collect($rows);
        $valid = $offers->where('action', '!=', 'invalid');

        return [
            'file' => $path,
            'sha256' => $sha256,
            'offers' => $offers->count(),
            'by_action' => $offers->countBy('action')->all(),
            'legacy_active' => $valid->where('legacy_active', true)->count(),
            'legacy_inactive' => $valid->where('legacy_active', false)->count(),
            'archived' => $valid->where('archive', true)->pluck('legacy_id')->values()->all(),
            'manual_review' => $offers->where('manual_review', true)->count(),
            'adopted_tours_with_bookings' => $valid->whereIn('action', ['adopt', 'update', 'unchanged'])->where('bookings_on_tour', '>', 0)->count(),
            'dates' => $valid->sum('dates'),
            'upcoming_dates' => $valid->sum('upcoming_dates'),
            'bookable_upcoming_dates' => $valid->sum('bookable_upcoming_dates'),
            'dates_with_own_stay' => $valid->sum('dates_with_own_stay'),
            'extras' => $valid->sum('extras'),
            'extras_paid_on_site' => $valid->sum('extras_paid_on_site'),
            'departure_place_links' => $valid->sum('departure_places'),
            'new_departure_places' => $valid->flatMap(fn (array $row): array => $row['new_departure_places'])->unique()->values()->all(),
            'gallery_images' => $valid->reduce(fn (array $carry, array $row): array => collect($row['gallery_images'])->reduce(fn (array $sum, int $count, string $collection): array => [...$sum, $collection => ($sum[$collection] ?? 0) + $count], $carry), []),
            'media_files' => $valid->sum('media_files'),
            'media_mirrored' => $valid->sum('media_mirrored'),
            'partner_bonuses' => $valid->sum('partner_bonuses'),
            'unmapped' => collect(['offer_groups', 'regions', 'region_groups'])
                ->mapWithKeys(fn (string $key): array => [$key => $valid->flatMap(fn (array $row): array => $row['unmapped'][$key])->countBy()->sortDesc()->all()])
                ->all(),
            'without_category' => $valid->filter(fn (array $row): bool => $row['categories'] === [])->count(),
            'without_country' => $valid->filter(fn (array $row): bool => $row['countries'] === [])->count(),
            'orphan_tours' => $orphans,
        ];
    }

    /**
     * @param  array<string, mixed>  $summary
     */
    private function printSummary(array $summary): void
    {
        $this->table(['', ''], [
            ['Offers', $summary['offers']],
            ...collect($summary['by_action'])->map(fn (int $count, string $action): array => ["  {$action}", $count])->values()->all(),
            ['Legacy active / inactive', "{$summary['legacy_active']} / {$summary['legacy_inactive']}"],
            ['Archived on import', implode(', ', $summary['archived']) ?: '-'],
            ['Need a manual look', $summary['manual_review']],
            ['Taken-over tours with bookings', $summary['adopted_tours_with_bookings']],
            ['Dates (upcoming / bookable)', "{$summary['dates']} ({$summary['upcoming_dates']} / {$summary['bookable_upcoming_dates']})"],
            ['Dates with their own stay', $summary['dates_with_own_stay']],
            ['Extras (paid on site)', "{$summary['extras']} ({$summary['extras_paid_on_site']})"],
            ['Departure place links (new places)', sprintf('%d (%d)', $summary['departure_place_links'], count($summary['new_departure_places']))],
            ['Gallery images', collect($summary['gallery_images'])->map(fn (int $count, string $collection): string => "{$collection}: {$count}")->implode(', ')],
            ['Media files (mirrored)', "{$summary['media_files']} ({$summary['media_mirrored']})"],
            ['Partner bonuses', $summary['partner_bonuses']],
            ['Without category / country', "{$summary['without_category']} / {$summary['without_country']}"],
            ['Orphan tours', count($summary['orphan_tours'])],
        ]);
    }
}
