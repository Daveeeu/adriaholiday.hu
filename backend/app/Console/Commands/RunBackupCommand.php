<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;

class RunBackupCommand extends Command
{
    protected $signature = 'backup:run';

    protected $description = 'Dumps the database and archives persistent storage/media, then prunes backups past their retention window.';

    public function handle(BackupService $backupService): int
    {
        if (config('backup.disabled')) {
            $this->warn('Backups are disabled (BACKUP_DISABLED) — skipping.');

            return self::SUCCESS;
        }

        $result = $backupService->run();

        if (! $result['database']) {
            $this->error('Database backup failed. Check the logs for details.');
        }

        if (! $result['storage']) {
            $this->error('Storage backup failed. Check the logs for details.');
        }

        if (! $result['database'] || ! $result['storage']) {
            return self::FAILURE;
        }

        $this->info('Backup run completed successfully.');

        return self::SUCCESS;
    }
}
