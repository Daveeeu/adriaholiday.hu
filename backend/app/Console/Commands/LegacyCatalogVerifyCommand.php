<?php

namespace App\Console\Commands;

use App\Services\Legacy\Catalog\LegacyCatalogReader;
use App\Services\Legacy\Catalog\LegacyCatalogReport;
use App\Services\Legacy\Catalog\LegacyCatalogVerifier;
use App\Support\Legacy\Catalog\LegacyCatalogException;
use Illuminate\Console\Command;

class LegacyCatalogVerifyCommand extends Command
{
    protected $signature = 'adria:catalog:verify
        {file : The legacy catalog export (adriaholiday-all-offers.json)}';

    protected $description = 'Check, right after adria:catalog:import, that the site holds the legacy catalog and that bookings kept their tours and dates.';

    public function handle(LegacyCatalogReader $reader, LegacyCatalogVerifier $verifier, LegacyCatalogReport $report): int
    {
        try {
            $catalog = $reader->read((string) $this->argument('file'));
        } catch (LegacyCatalogException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $checks = $verifier->verify($catalog);

        $this->table(['Check', 'Result'], array_map(fn (array $check): array => [$check['check'], $check['ok'] ? 'OK' : count($check['details']).' problem(s)'], $checks));

        foreach ($checks as $check) {
            foreach (array_slice($check['details'], 0, 20) as $detail) {
                $this->warn("{$check['check']}: {$detail}");
            }
        }

        $paths = $report->write('verify', ['ok' => collect($checks)->every('ok')], $checks, ['check', 'ok', 'details']);
        $this->info("Report: {$paths['json']}");

        return collect($checks)->every('ok') ? self::SUCCESS : self::FAILURE;
    }
}
