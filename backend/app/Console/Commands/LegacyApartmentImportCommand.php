<?php

namespace App\Console\Commands;

use App\Services\Legacy\Apartments\LegacyApartmentExportReader;
use App\Services\Legacy\Apartments\LegacyApartmentImporter;
use App\Services\Legacy\Catalog\LegacyCatalogReport;
use App\Support\Legacy\Apartments\LegacyApartmentExportException;
use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;
use Illuminate\Support\Facades\Storage;

class LegacyApartmentImportCommand extends Command
{
    use ConfirmableTrait;

    private const REPORT_COLUMNS = [
        'legacy_id', 'name', 'slug', 'code', 'list', 'listed', 'action', 'apartment_id', 'location',
        'images', 'images_copied', 'price_periods', 'upcoming_price_periods', 'apartment_types', 'services', 'messages',
    ];

    protected $signature = 'adria:apartments:import
        {file? : The legacy apartment export (default: storage/app/private/legacy-import/adriaholiday-apartments.json)}
        {--dry-run : Only report what would happen; nothing is written}
        {--media=listed : Copy the gallery images of the "listed" apartments, of "all" of them, or of "none"}
        {--remove-others : Also take the apartments without a legacy id off the site: soft-deleted, or deactivated when booked}
        {--force : Run in production without asking}';

    protected $description = 'Import the legacy apartments: each becomes (or updates) the apartment of its legacy id. The legacy site\'s listed apartments are published, the others imported inactive. Back up the database first.';

    public function handle(LegacyApartmentExportReader $reader, LegacyApartmentImporter $importer, LegacyCatalogReport $report): int
    {
        $mediaMode = (string) $this->option('media');

        if (! in_array($mediaMode, [LegacyApartmentImporter::MEDIA_LISTED, LegacyApartmentImporter::MEDIA_ALL, LegacyApartmentImporter::MEDIA_NONE], true)) {
            $this->error('--media must be "listed", "all" or "none".');

            return self::FAILURE;
        }

        try {
            $export = $reader->read((string) ($this->argument('file') ?? Storage::disk('local')->path((string) config('legacy_apartments.file'))));
        } catch (LegacyApartmentExportException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');

        if (! $dryRun && ! $this->confirmToProceed('This imports the legacy apartments into the database.')) {
            return self::FAILURE;
        }

        $result = $importer->import(
            $export,
            $dryRun,
            $mediaMode,
            (bool) $this->option('remove-others'),
            fn (int $legacyId, string $action, string $name) => $this->output->isVerbose() ? $this->line(sprintf('[%s] %d %s', strtoupper($action), $legacyId, $name)) : null,
        );

        $rows = collect($result['rows']);
        $summary = [
            'file' => $export->path,
            'sha256' => $export->sha256,
            'exported_at' => $export->generatedAt,
            'dry_run' => $dryRun,
            'media' => $mediaMode,
            'apartments' => $rows->count(),
            'listed' => $rows->where('listed', true)->count(),
            'by_action' => $rows->countBy('action')->all(),
            'images' => $rows->sum('images'),
            'images_copied' => $rows->sum('images_copied'),
            'with_upcoming_prices' => $rows->where('upcoming_price_periods', '>', 0)->count(),
            'other_apartments' => $result['other_apartments'],
            'run' => $result['run']?->only(['id', 'status']),
        ];

        $this->table(['', ''], [
            ['Apartments (listed on the legacy site)', "{$summary['apartments']} ({$summary['listed']})"],
            ...collect($summary['by_action'])->map(fn (int $count, string $action): array => ["  {$action}", $count])->values()->all(),
            ['Gallery images (copied now)', "{$summary['images']} ({$summary['images_copied']})"],
            ['With prices still to come', $summary['with_upcoming_prices']],
            ['Other apartments removed / deactivated (booked)'.($dryRun ? ', would be' : ''), count($summary['other_apartments']['removed']).' / '.count($summary['other_apartments']['deactivated'])],
        ]);

        $paths = $report->write($dryRun ? 'apartments-dry-run' : 'apartments-import-run-'.$result['run']?->id, $summary, $result['rows'], self::REPORT_COLUMNS, 'apartments');

        foreach ($rows->whereIn('action', [LegacyApartmentImporter::CONFLICT, LegacyApartmentImporter::FAILED]) as $row) {
            $this->warn(sprintf('%s %d %s: %s', $row['action'], $row['legacy_id'], $row['name'], implode(' ', $row['messages'])));
        }

        $this->info(($dryRun ? 'Dry run, nothing was written. ' : '')."Report: {$paths['json']} and {$paths['csv']}");

        return $rows->where('action', LegacyApartmentImporter::FAILED)->isEmpty() ? self::SUCCESS : self::FAILURE;
    }
}
