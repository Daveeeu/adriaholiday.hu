<?php

namespace App\Console\Commands;

use App\Services\Tour\DeparturePlaceConsolidator;
use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;

class ConsolidateDeparturePlacesCommand extends Command
{
    use ConfirmableTrait;

    protected $signature = 'adria:departure-places:consolidate
        {--dry-run : Only report what would happen; nothing is written}
        {--force : Run in production without asking}';

    protected $description = 'Give every tour with departure places one place per town (the office\'s standard route for its destination) and delete the places no tour uses. Back up the database first.';

    public function handle(DeparturePlaceConsolidator $consolidator): int
    {
        $dryRun = (bool) $this->option('dry-run');

        if (! $dryRun && ! $this->confirmToProceed('This replaces the departure places of every tour.')) {
            return self::FAILURE;
        }

        $result = $consolidator->consolidate($dryRun);

        $this->table(['Tour', 'Name', 'Route', 'Before', 'After'], array_map(fn (array $row): array => [
            $row['id'],
            $row['name'],
            $row['route'],
            implode(' | ', $row['before']),
            implode(', ', $row['after']),
        ], $result['tours']));

        $this->line('Tours: '.count($result['tours']).', by route: '.collect($result['tours'])->countBy('route')->map(fn (int $count, string $route): string => "{$route} {$count}")->implode(', '));
        $this->line('Places created: '.(implode(', ', $result['created']) ?: '-'));
        $this->line('Places deleted ('.count($result['deleted']).'): '.(implode(' | ', $result['deleted']) ?: '-'));

        if (! $dryRun) {
            $this->line("Dates remapped: {$result['dates']}");
        }

        $this->info($dryRun ? 'Dry run: nothing was written.' : 'Departure places consolidated.');

        return self::SUCCESS;
    }
}
