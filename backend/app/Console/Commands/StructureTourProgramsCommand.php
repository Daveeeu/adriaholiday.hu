<?php

namespace App\Console\Commands;

use App\Services\Tour\ProgramStructure\TourProgramStructurer;
use App\Support\PrivateReport;
use Illuminate\Console\Command;

class StructureTourProgramsCommand extends Command
{
    private const REPORT_DIRECTORY = 'tour-program-structure';

    private const REPORT_COLUMNS = ['tour_id', 'name', 'status', 'days', 'included', 'excluded', 'moved_to', 'manual_review', 'reasons'];

    protected $signature = 'adria:tours:structure-program
        {--apply : Write the changes; without it this is a dry run}
        {--dry-run : Only report what would happen (the default)}
        {--tour=* : Only these tour ids}
        {--force : Also split tours that already have program days or price items, replacing them}';

    protected $description = 'Split the one-block program of active tours into program days and price items, moving the rest of the text to the matching tour fields. Repeatable; programs that cannot be split with confidence are only reported for manual review. Back up the database before --apply.';

    public function handle(TourProgramStructurer $structurer, PrivateReport $report): int
    {
        $apply = (bool) $this->option('apply');

        if ($apply && $this->option('dry-run')) {
            $this->error('Use either --apply or --dry-run.');

            return self::FAILURE;
        }

        $tourIds = array_values(array_map('intval', (array) $this->option('tour')));
        $result = $structurer->run($apply, $tourIds, (bool) $this->option('force'));
        $rows = $result['rows'];

        $this->table(['Tour', 'Name', 'Status', 'Days', 'Incl.', 'Excl.', 'Rest moved to', 'Reasons'], array_map(fn (array $row): array => [
            $row['tour_id'],
            mb_strimwidth($row['name'], 0, 40, '…'),
            $row['status'],
            $row['days'],
            $row['included'],
            $row['excluded'],
            implode(', ', $row['moved_to']),
            $row['reasons'],
        ], $rows));

        $summary = [
            'mode' => $apply ? 'apply' : 'dry-run',
            'force' => (bool) $this->option('force'),
            'tours' => count($rows),
            ...array_count_values(array_column($rows, 'status')),
            'days' => array_sum(array_column($rows, 'days')),
            'price_items' => array_sum(array_column($rows, 'included')) + array_sum(array_column($rows, 'excluded')),
        ];

        $paths = $report->write(self::REPORT_DIRECTORY, $apply ? 'apply' : 'dry-run', $summary, $rows, self::REPORT_COLUMNS, 'tours', ['originals' => $result['originals']]);

        if ($tourIds !== [] && count($rows) < count(array_unique($tourIds))) {
            $this->warn('Some of the given tours are not active (or do not exist) and were left out.');
        }

        $this->line(collect($summary)->map(fn (mixed $value, string $key): string => "{$key}: ".(is_bool($value) ? ($value ? 'yes' : 'no') : $value))->implode(', '));
        $review = array_column(array_filter($rows, fn (array $row): bool => $row['manual_review']), 'tour_id');
        $this->line('Manual review: '.($review === [] ? '-' : implode(', ', $review)));
        $this->line("Report: {$paths['csv']}");
        $this->info($apply ? 'Programs structured.' : 'Dry run: nothing was written.');

        return self::SUCCESS;
    }
}
