<?php

namespace Tests\Feature;

use App\Services\BackupService;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

/**
 * Proves the previously-fictional backup strategy (DEPLOY_PROD.md described
 * a daily mysqldump/tar cron job that did not exist anywhere in the repo)
 * is now a real, scheduled, retention-managed command.
 */
class BackupCommandTest extends TestCase
{
    private string $backupPath;

    private string $mediaSource;

    protected function setUp(): void
    {
        parent::setUp();

        $this->backupPath = storage_path('framework/testing/backup-'.uniqid());
        config(['backup.path' => $this->backupPath]);

        $this->mediaSource = storage_path('app/public');
        File::ensureDirectoryExists($this->mediaSource);
        File::put($this->mediaSource.'/sample.txt', 'sample media file');
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->backupPath);
        File::deleteDirectory(storage_path('app/public'));

        parent::tearDown();
    }

    public function test_backup_run_is_skipped_when_disabled(): void
    {
        config(['backup.disabled' => true]);

        $this->artisan('backup:run')->assertExitCode(0);

        $this->assertDirectoryDoesNotExist($this->backupPath);
    }

    /**
     * The test suite runs against sqlite, which has no supported dump
     * command wired up (production only ever runs mysql/mariadb/pgsql) —
     * this proves that case degrades to a clear, logged failure instead of
     * a crash, while the storage archive step (independent of the DB
     * driver) still succeeds and produces a real tar.gz.
     */
    public function test_backup_archives_storage_media_and_reports_database_failure_on_unsupported_driver(): void
    {
        $result = app(BackupService::class)->run();

        $this->assertFalse($result['database']);
        $this->assertTrue($result['storage']);

        $this->assertDirectoryExists($this->backupPath.'/database');
        $this->assertEmpty(File::files($this->backupPath.'/database'));

        $storageFiles = File::files($this->backupPath.'/storage');
        $this->assertCount(1, $storageFiles);
        $this->assertStringEndsWith('-media.tar.gz', $storageFiles[0]->getFilename());
        $this->assertGreaterThan(0, $storageFiles[0]->getSize());
    }

    public function test_backup_skips_storage_archive_gracefully_when_media_directory_missing(): void
    {
        File::deleteDirectory($this->mediaSource);

        $result = app(BackupService::class)->run();

        $this->assertTrue($result['storage']);
        $this->assertEmpty(File::files($this->backupPath.'/storage'));
    }

    public function test_backup_prunes_files_past_retention_but_keeps_recent_ones(): void
    {
        config(['backup.database_retention_days' => 1]);

        $databaseDir = $this->backupPath.'/database';
        File::ensureDirectoryExists($databaseDir);

        $oldFile = $databaseDir.'/2020-01-01_000000-old.sql.gz';
        File::put($oldFile, 'old dump');
        touch($oldFile, now()->subDays(5)->getTimestamp());

        $recentFile = $databaseDir.'/2020-01-01_000000-recent.sql.gz';
        File::put($recentFile, 'recent dump');

        app(BackupService::class)->run();

        $this->assertFileDoesNotExist($oldFile);
        $this->assertFileExists($recentFile);
    }

    public function test_backup_command_reports_failure_exit_code_when_database_dump_is_unsupported(): void
    {
        $this->artisan('backup:run')->assertExitCode(1);
    }
}
