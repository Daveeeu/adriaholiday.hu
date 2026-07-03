<?php

namespace App\Console\Commands;

use App\Support\ProductionHealth;
use Illuminate\Console\Command;

class HealthcheckCommand extends Command
{
    protected $signature = 'app:healthcheck {--json : Output full JSON payload}';

    protected $description = 'Run production health checks for containers and monitoring.';

    public function handle(ProductionHealth $health): int
    {
        $snapshot = $health->snapshot();

        if ($this->option('json')) {
            $this->line(json_encode($snapshot, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } else {
            $this->info(sprintf('Health status: %s', $snapshot['status']));

            foreach ($snapshot['checks'] as $name => $check) {
                $this->line(sprintf('- %s: %s (%s)', $name, $check['status'], $check['message']));
            }
        }

        return $snapshot['status'] === 'ok' ? self::SUCCESS : self::FAILURE;
    }
}
