<?php

namespace App\Console\Commands;

use App\Services\Tour\DepartedTourDatePruner;
use Illuminate\Console\Command;

class PruneDepartedTourDatesCommand extends Command
{
    protected $signature = 'tours:prune-departed-dates {--force : Delete the dates (without it, only reports them)}';

    protected $description = 'Soft delete the tour dates whose departure day has passed; the tours stay.';

    public function handle(DepartedTourDatePruner $pruner): int
    {
        $write = (bool) $this->option('force');
        $result = $pruner->run(dryRun: ! $write);

        $this->info(sprintf(
            '%s%d departed date(s) of %d tour(s) %s.',
            $write ? '' : '[DRY RUN] ',
            $result['dates'],
            $result['tours'],
            $write ? 'soft deleted' : 'to soft delete',
        ));

        if (! $write) {
            $this->line('Run again with --force to delete them.');
        }

        return self::SUCCESS;
    }
}
