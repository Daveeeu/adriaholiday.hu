<?php

namespace App\Console\Commands;

use App\Services\Legacy\AdminExport\LegacyAdminExportImportService;
use App\Services\Legacy\AdminExport\LegacyAdminExportReader;
use App\Support\Legacy\AdminExport\LegacyAdminExportContext;
use App\Support\Legacy\AdminExport\LegacyAdminExportException;
use App\Support\Legacy\AdminExport\LegacyAdminExportStepResult;
use Illuminate\Console\Command;
use Illuminate\Console\ConfirmableTrait;
use InvalidArgumentException;

class LegacyAdminExportImportCommand extends Command
{
    use ConfirmableTrait;

    /** The full export is large; its records are all held in memory while they are imported. */
    private const MEMORY_LIMIT = '2048M';

    protected $signature = 'adria:legacy:import
        {file : The full legacy admin export (adriaholiday_export_*.json)}
        {--only=* : Run only these steps (repeatable); see --list}
        {--list : List the steps in the order they run}
        {--media=listed : Copy the images of every imported record, but the apartment galleries only of the apartments the legacy admin keeps active ("listed"), of "all" apartments, or copy "none"}
        {--dry-run : Only report what would happen; nothing is written}
        {--force : Run in production without asking}';

    protected $description = 'Import the full legacy admin export: customers, bookings, inquiries, messages, coupons, pages, redirects and more. Re-runs update what changed. Back up the database first.';

    public function handle(LegacyAdminExportReader $reader, LegacyAdminExportImportService $service): int
    {
        if ($this->option('list')) {
            $this->line(implode(PHP_EOL, $service->stepKeys()));

            return self::SUCCESS;
        }

        $mediaMode = (string) $this->option('media');

        if (! in_array($mediaMode, LegacyAdminExportContext::MEDIA_MODES, true)) {
            $this->error('--media must be "listed", "all" or "none".');

            return self::FAILURE;
        }

        ini_set('memory_limit', self::MEMORY_LIMIT);

        try {
            $export = $reader->read((string) $this->argument('file'));
        } catch (LegacyAdminExportException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');

        if (! $dryRun && ! $this->confirmToProceed('This imports the legacy admin export into the database.')) {
            return self::FAILURE;
        }

        try {
            $outcome = $service->import(
                $export,
                array_values(array_filter((array) $this->option('only'))),
                $dryRun,
                $mediaMode,
                fn (string $step, ?int $legacyId, string $result) => $this->output->isVerbose() ? $this->line(sprintf('[%s] %s #%s', strtoupper($result), $step, $legacyId ?? '-')) : null,
            );
        } catch (InvalidArgumentException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $columns = [LegacyAdminExportStepResult::CREATED, LegacyAdminExportStepResult::UPDATED, LegacyAdminExportStepResult::UNCHANGED, LegacyAdminExportStepResult::SKIPPED, LegacyAdminExportStepResult::FAILED];
        $this->table(
            ['Step', ...$columns],
            array_map(fn (LegacyAdminExportStepResult $result): array => [$result->step, ...array_map(fn (string $column): int => $result->counts()[$column], $columns)], $outcome['results']),
        );

        foreach ($outcome['results'] as $result) {
            foreach (array_slice($result->messages(), 0, 20) as $message) {
                $this->warn("{$result->step}: {$message}");
            }

            if (count($result->messages()) > 20) {
                $this->warn(sprintf('%s: … and %d more (see the run summary).', $result->step, count($result->messages()) - 20));
            }
        }

        $this->info($dryRun ? 'Dry run, nothing was written.' : "Run #{$outcome['run']?->id} finished.");

        return collect($outcome['results'])->contains(fn (LegacyAdminExportStepResult $result): bool => $result->hasFailures()) ? self::FAILURE : self::SUCCESS;
    }
}
