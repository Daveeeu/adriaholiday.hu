<?php

namespace App\Console\Commands;

use App\Services\Legacy\LegacyBookingImporter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AdriaImportLegacyBookingsCommand extends Command
{
    protected $signature = 'adria:import-legacy-bookings
        {path : JSON file with the bookings exported from the legacy admin}
        {--dry-run : Report what would be imported without writing anything}';

    protected $description = 'Import tour bookings exported from the legacy adriaholiday.hu admin; bookings already imported (same position number) are skipped and no e-mails are sent.';

    public function handle(LegacyBookingImporter $importer): int
    {
        $records = json_decode((string) @file_get_contents((string) $this->argument('path')), true);

        if (! is_array($records)) {
            $this->error('The file is missing or is not a JSON array of bookings.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $counts = ['imported' => 0, 'already_imported' => 0, 'invalid' => 0];
        $withoutTour = [];
        $withoutDate = 0;

        DB::transaction(function () use ($records, $importer, $dryRun, &$counts, &$withoutTour, &$withoutDate): void {
            foreach ($records as $record) {
                $result = $importer->import(is_array($record) ? $record : [], $dryRun);
                $counts[$result->outcome]++;

                if ($result->outcome === 'invalid') {
                    $this->warn('Skipped #'.($record['id'] ?? '?').": {$result->reason}");
                }

                if ($result->outcome === 'imported' && ! $result->tourMatched) {
                    $withoutTour[$result->offerName] = ($withoutTour[$result->offerName] ?? 0) + 1;
                } elseif ($result->outcome === 'imported' && ! $result->dateMatched) {
                    $withoutDate++;
                }
            }
        });

        $this->info($dryRun ? 'Dry run – nothing was written.' : 'Import finished.');
        $this->table(['Result', 'Count'], [
            [$dryRun ? 'Would import' : 'Imported', $counts['imported']],
            ['Already imported (skipped)', $counts['already_imported']],
            ['Invalid (skipped)', $counts['invalid']],
            ['Imported without a matching tour', array_sum($withoutTour)],
            ['Imported with tour but without matching date', $withoutDate],
        ]);

        if ($withoutTour !== []) {
            arsort($withoutTour);
            $this->warn('Legacy offers without a matching tour:');
            $this->table(['Legacy offer', 'Bookings'], collect($withoutTour)->map(fn (int $count, string $name): array => [$name, $count])->values()->all());
        }

        return self::SUCCESS;
    }
}
