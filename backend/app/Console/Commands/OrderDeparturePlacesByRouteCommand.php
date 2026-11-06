<?php

namespace App\Console\Commands;

use App\Services\Tour\DeparturePlaceRouteOrder;
use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;

class OrderDeparturePlacesByRouteCommand extends Command
{
    use ConfirmableTrait;

    protected $signature = 'adria:departure-places:route-order
        {--dry-run : Only report what would happen; nothing is written}
        {--force : Run in production without asking}';

    protected $description = 'Put every tour\'s departure places in the boarding order of the office\'s routes; the places themselves do not change. Back up the database first.';

    public function handle(DeparturePlaceRouteOrder $routeOrder): int
    {
        $dryRun = (bool) $this->option('dry-run');

        if (! $dryRun && ! $this->confirmToProceed('This reorders the departure places of every tour.')) {
            return self::FAILURE;
        }

        $result = $routeOrder->apply($dryRun);
        $rows = fn (array $tours): array => array_map(fn (array $tour): array => [
            $tour['id'],
            $tour['active'] ? 'yes' : 'no',
            $tour['name'],
            implode(', ', $tour['after']),
        ], $tours);

        $this->table(['Tour', 'Active', 'Name', 'Order'], $rows($result['changed']));

        if ($result['unmatched'] !== []) {
            $this->warn('On no route, left as they are:');
            $this->table(['Tour', 'Active', 'Name', 'Order'], $rows($result['unmatched']));
        }

        $this->line('Changed: '.count($result['changed']).", already in order: {$result['unchanged']}, on no route: ".count($result['unmatched']));
        $this->info($dryRun ? 'Dry run: nothing was written.' : 'Departure places ordered.');

        return self::SUCCESS;
    }
}
