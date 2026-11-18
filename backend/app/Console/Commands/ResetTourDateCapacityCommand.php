<?php

namespace App\Console\Commands;

use App\Services\Tour\TourDateCapacityReset;
use App\Support\Tour\TourDateCapacity;
use Illuminate\Console\Command;

class ResetTourDateCapacityCommand extends Command
{
    protected $signature = 'adria:tours:reset-date-capacity {--force : Write the changes (without it, only reports them)}';

    protected $description = 'Set every upcoming tour date\'s capacity to its travel mode\'s default ('.TourDateCapacity::COACH.' seats, '.TourDateCapacity::PLANE.' on flying tours).';

    public function handle(TourDateCapacityReset $reset): int
    {
        $write = (bool) $this->option('force');
        $result = $reset->run(dryRun: ! $write);

        foreach ($result['overbooked'] as $date) {
            $this->warn(sprintf(
                '[OVERBOOKED] %s %s: %d passengers booked, above the %d limit; capacity kept at %d (sold out).',
                $date['tour'],
                $date['date'],
                $date['seatsHeld'],
                $date['capacity'],
                $date['seatsHeld'],
            ));
        }

        $this->info(sprintf(
            '%s%d date(s) %s, %d already right.',
            $write ? '' : '[DRY RUN] ',
            $result['changed'],
            $write ? 'updated' : 'to update',
            $result['unchanged'],
        ));

        if (! $write) {
            $this->line('Run again with --force to write the changes.');
        }

        return self::SUCCESS;
    }
}
