<?php

namespace App\Console\Commands;

use App\Services\Tour\ExpiredTourService;
use Illuminate\Console\Command;

class SyncExpiredToursCommand extends Command
{
    protected $signature = 'tours:sync-expired';

    protected $description = 'Switch off tours whose every date has departed, and back on those that got a new date since.';

    public function handle(ExpiredTourService $expiredTours): int
    {
        $result = $expiredTours->sync();

        foreach ($result['deactivated'] as $slug) {
            $this->line("[EXPIRED] {$slug}");
        }

        foreach ($result['reactivated'] as $slug) {
            $this->line("[REACTIVATED] {$slug}");
        }

        $this->info(sprintf('%d tour(s) switched off, %d switched back on.', count($result['deactivated']), count($result['reactivated'])));

        return self::SUCCESS;
    }
}
