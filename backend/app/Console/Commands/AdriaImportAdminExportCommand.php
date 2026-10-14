<?php

namespace App\Console\Commands;

use App\Services\Legacy\LegacyAdminOfferImporter;
use App\Services\Legacy\LegacyAdminOfferReader;
use App\Services\Legacy\LegacyImportOutcome;
use Illuminate\Console\Command;
use Throwable;

class AdriaImportAdminExportCommand extends Command
{
    protected $signature = 'adria:import-admin-export
        {file : JSON exported from the legacy admin (read-only, in the browser)}
        {--slug=* : Import only these tours (seo name, repeatable)}
        {--except=* : Leave these tours out (seo name, repeatable)}
        {--dry-run : Only print what would be imported}';

    protected $description = 'Update existing tours from a legacy admin export: texts word for word, dates, prices, seats, extras, departure places and coupon acceptance.';

    public function handle(LegacyAdminOfferReader $reader, LegacyAdminOfferImporter $importer): int
    {
        $path = (string) $this->argument('file');
        $export = is_file($path) ? json_decode((string) file_get_contents($path), true) : null;

        if (! is_array($export) || ! is_array($export['offers'] ?? null)) {
            $this->error("Not a legacy admin export: {$path}");

            return self::FAILURE;
        }

        $only = $this->option('slug');
        $except = $this->option('except');
        $counts = array_fill_keys(array_map(fn (LegacyImportOutcome $case): string => $case->value, LegacyImportOutcome::cases()), 0) + ['failed' => 0];

        foreach ($export['offers'] as $offer) {
            $slug = trim((string) ($offer['form']['seo_name'] ?? ''));

            if (($only !== [] && ! in_array($slug, $only, true)) || in_array($slug, $except, true)) {
                continue;
            }

            try {
                if ($this->option('dry-run')) {
                    $data = $reader->read($offer);
                    $this->line(sprintf(
                        '%s: %d dates, program %d chars, coupon %s, %d departure places',
                        $slug,
                        count($data['dates']),
                        mb_strlen((string) $data['program']),
                        $data['couponable'] ? 'yes' : 'no',
                        collect($data['dates'])->flatMap(fn (array $date): array => array_column($date['departure_places'], 'name'))->unique()->count(),
                    ));

                    continue;
                }

                $outcome = $importer->import($offer);
                $counts[$outcome->value]++;
                $this->line(sprintf('[%s] %s', strtoupper($outcome->value), $slug));
            } catch (Throwable $exception) {
                $counts['failed']++;
                $this->error("{$slug}: {$exception->getMessage()}");
            }
        }

        if (! $this->option('dry-run')) {
            $this->table(['Outcome', 'Count'], collect($counts)->map(fn (int $count, string $outcome): array => [$outcome, $count])->values()->all());
        }

        return $counts['failed'] > 0 ? self::FAILURE : self::SUCCESS;
    }
}
