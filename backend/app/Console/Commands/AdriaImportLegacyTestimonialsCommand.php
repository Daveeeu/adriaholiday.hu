<?php

namespace App\Console\Commands;

use App\Services\Legacy\LegacyImportOutcome;
use App\Services\Legacy\LegacyTestimonialImporter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AdriaImportLegacyTestimonialsCommand extends Command
{
    protected $signature = 'adria:import-legacy-testimonials
        {path : JSON file with the "Rólunk írták" entries exported from the legacy admin}
        {--dry-run : Report what would be imported without writing anything}';

    protected $description = 'Import the guest letters ("Rólunk írták") exported from the legacy adriaholiday.hu admin; entries already imported are skipped.';

    public function handle(LegacyTestimonialImporter $importer): int
    {
        $records = json_decode((string) @file_get_contents((string) $this->argument('path')), true);

        if (! is_array($records)) {
            $this->error('The file is missing or is not a JSON array of entries.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $counts = ['imported' => 0, 'skipped' => 0, 'invalid' => 0];

        DB::transaction(function () use ($records, $dryRun, $importer, &$counts): void {
            foreach ($records as $record) {
                $outcome = is_array($record) ? $importer->import($record, $dryRun) : false;
                $counts[match ($outcome) {
                    false => 'invalid',
                    LegacyImportOutcome::Skipped => 'skipped',
                    default => 'imported',
                }]++;
            }
        });

        $this->info($dryRun ? 'Dry run – nothing was written.' : 'Import finished.');
        $this->table(['Result', 'Count'], [
            [$dryRun ? 'Would import' : 'Imported', $counts['imported']],
            ['Already imported (skipped)', $counts['skipped']],
            ['Invalid (skipped)', $counts['invalid']],
        ]);

        return self::SUCCESS;
    }
}
