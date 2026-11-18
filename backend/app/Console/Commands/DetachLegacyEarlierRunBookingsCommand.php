<?php

namespace App\Console\Commands;

use App\Services\Legacy\LegacyEarlierRunDetacher;
use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;

class DetachLegacyEarlierRunBookingsCommand extends Command
{
    use ConfirmableTrait;

    protected $signature = 'adria:legacy-bookings:detach-earlier-runs
        {--dry-run : Only report what would happen; nothing is written}
        {--force : Run in production without asking}';

    protected $description = 'Take legacy bookings made for an earlier run of a reused legacy date off its later run, and lower each date\'s capacity by the seats they held, so its free seats stay the same. Back up the database first.';

    public function handle(LegacyEarlierRunDetacher $detacher): int
    {
        $dryRun = (bool) $this->option('dry-run');

        if (! $dryRun && ! $this->confirmToProceed('This unlinks legacy bookings from their tour dates and lowers those dates\' capacity.')) {
            return self::FAILURE;
        }

        $result = $detacher->detach($dryRun);

        $this->table(['Date', 'Tour', 'Start', 'Bookings', 'Seats', 'Capacity'], array_map(fn (array $row): array => [
            $row['id'],
            $row['tour'] ?? '-',
            $row['start_date'] ?? '-',
            $row['bookings'],
            $row['seats'],
            $row['capacity_before'] === null ? '-' : "{$row['capacity_before']} → {$row['capacity_after']}",
        ], $result['dates']));

        $this->line("Bookings: {$result['bookings']}, of them on a date: ".array_sum(array_column($result['dates'], 'bookings')).', dates: '.count($result['dates']));
        $this->info($dryRun ? 'Dry run: nothing was written.' : 'Earlier-run legacy bookings detached.');

        return self::SUCCESS;
    }
}
