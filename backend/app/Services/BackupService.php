<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

/**
 * Produces a daily, retention-managed backup of the database and the
 * persistent storage/media volume. Intended to be run by the scheduler
 * container (see routes/console.php) so backups exist without depending
 * on any manual, undocumented process.
 */
class BackupService
{
    /**
     * @return array{database: bool, storage: bool}
     */
    public function run(): array
    {
        $basePath = rtrim((string) config('backup.path'), '/');
        $databasePath = $basePath.'/database';
        $storagePath = $basePath.'/storage';

        File::ensureDirectoryExists($databasePath);
        File::ensureDirectoryExists($storagePath);

        $timestamp = now()->format('Y-m-d_His');

        $databaseOk = $this->backupDatabase($databasePath, $timestamp);
        $storageOk = $this->backupStorage($storagePath, $timestamp);

        $this->pruneOldFiles($databasePath, (int) config('backup.database_retention_days'));
        $this->pruneOldFiles($storagePath, (int) config('backup.storage_retention_days'));

        return ['database' => $databaseOk, 'storage' => $storageOk];
    }

    private function backupDatabase(string $databasePath, string $timestamp): bool
    {
        $connectionName = config('database.default');
        $connection = config("database.connections.{$connectionName}");
        $driver = $connection['driver'] ?? null;

        $dumpCommand = match ($driver) {
            'mysql', 'mariadb' => $this->mysqlDumpCommand($connection),
            'pgsql' => $this->pgsqlDumpCommand($connection),
            default => null,
        };

        if ($dumpCommand === null) {
            Log::error("backup:run — no database dump command available for driver \"{$driver}\".");

            return false;
        }

        [$command, $env] = $dumpCommand;
        $file = "{$databasePath}/{$timestamp}-{$connection['database']}.sql.gz";

        $process = Process::fromShellCommandline(
            $command.' | gzip -9 > '.escapeshellarg($file),
            null,
            $env,
            null,
            300,
        );
        $process->run();

        if (! $process->isSuccessful()) {
            File::delete($file);
            Log::error('backup:run — database dump failed.', ['error' => $process->getErrorOutput()]);

            return false;
        }

        return true;
    }

    /**
     * @param  array<string, mixed>  $connection
     * @return array{0: string, 1: array<string, string>}
     */
    private function mysqlDumpCommand(array $connection): array
    {
        $command = sprintf(
            'mysqldump --host=%s --port=%s --user=%s --single-transaction --quick --skip-lock-tables %s',
            escapeshellarg((string) $connection['host']),
            escapeshellarg((string) $connection['port']),
            escapeshellarg((string) $connection['username']),
            escapeshellarg((string) $connection['database']),
        );

        return [$command, ['MYSQL_PWD' => (string) $connection['password']]];
    }

    /**
     * @param  array<string, mixed>  $connection
     * @return array{0: string, 1: array<string, string>}
     */
    private function pgsqlDumpCommand(array $connection): array
    {
        $command = sprintf(
            'pg_dump --host=%s --port=%s --username=%s --no-password %s',
            escapeshellarg((string) $connection['host']),
            escapeshellarg((string) $connection['port']),
            escapeshellarg((string) $connection['username']),
            escapeshellarg((string) $connection['database']),
        );

        return [$command, ['PGPASSWORD' => (string) $connection['password']]];
    }

    private function backupStorage(string $storagePath, string $timestamp): bool
    {
        $source = storage_path('app/public');

        if (! File::isDirectory($source)) {
            Log::warning("backup:run — storage source directory does not exist, skipping: {$source}");

            return true;
        }

        $file = "{$storagePath}/{$timestamp}-media.tar.gz";

        $process = new Process(['tar', '-czf', $file, '-C', $source, '.'], null, null, null, 600);
        $process->run();

        if (! $process->isSuccessful()) {
            File::delete($file);
            Log::error('backup:run — storage archive failed.', ['error' => $process->getErrorOutput()]);

            return false;
        }

        return true;
    }

    private function pruneOldFiles(string $path, int $retentionDays): void
    {
        $cutoff = now()->subDays($retentionDays)->getTimestamp();

        foreach (File::files($path) as $file) {
            if ($file->getMTime() < $cutoff) {
                File::delete($file->getPathname());
            }
        }
    }
}
