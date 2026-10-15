<?php

namespace App\Console\Commands;

use App\Services\Legacy\Catalog\LegacyCatalogReader;
use App\Services\Legacy\Catalog\LegacyCatalogValidator;
use App\Support\Legacy\Catalog\LegacyCatalogException;
use Illuminate\Console\Command;

class LegacyCatalogValidateCommand extends Command
{
    protected $signature = 'adria:catalog:validate
        {file : The legacy catalog export (adriaholiday-all-offers.json)}';

    protected $description = 'Check the structure of the legacy offer catalog export without importing anything.';

    public function handle(LegacyCatalogReader $reader, LegacyCatalogValidator $validator): int
    {
        try {
            $catalog = $reader->read((string) $this->argument('file'));
        } catch (LegacyCatalogException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $catalogErrors = $validator->catalogErrors($catalog);
        $boardingPoints = $catalog->boardingPoints();
        $invalid = 0;
        $warnings = 0;

        foreach ($catalogErrors as $error) {
            $this->error($error);
        }

        foreach ($catalog->offers as $index => $offer) {
            $issues = $validator->offerIssues($offer, $boardingPoints);
            $label = is_array($offer) ? sprintf('%s (%s)', $offer['legacy_id'] ?? "#{$index}", $offer['slug'] ?? '?') : "#{$index}";
            $invalid += $issues['errors'] !== [] ? 1 : 0;
            $warnings += count($issues['warnings']);

            foreach ($issues['errors'] as $error) {
                $this->error("{$label}: {$error}");
            }

            foreach ($issues['warnings'] as $warning) {
                $this->warn("{$label}: {$warning}");
            }
        }

        $this->table(['Check', 'Result'], [
            ['File', $catalog->path],
            ['SHA-256', $catalog->sha256],
            ['Exported at', $catalog->generatedAt ?? '-'],
            ['Offers', count($catalog->offers)],
            ['Departures', collect($catalog->offers)->sum(fn (mixed $offer): int => is_array($offer) ? count($offer['departures'] ?? []) : 0)],
            ['Boarding points (reference)', count($boardingPoints)],
            ['File errors', count($catalogErrors)],
            ['Invalid offers', $invalid],
            ['Warnings', $warnings],
        ]);

        return $catalogErrors === [] && $invalid === 0 ? self::SUCCESS : self::FAILURE;
    }
}
