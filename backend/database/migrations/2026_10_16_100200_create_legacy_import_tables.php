<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bookkeeping of the legacy catalog import:
 *  - legacy_import_runs: one row per run (file, its hash, mode, outcome);
 *  - legacy_import_records: every legacy record the import wrote, with its
 *    original JSON word for word (so no legacy HTML or field is ever lost)
 *    and the hash that lets a re-run skip unchanged records;
 *  - legacy_media_files: every legacy file URL and the media it was
 *    mirrored to, or why it could not be.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('legacy_import_runs', function (Blueprint $table): void {
            $table->id();
            $table->string('source_file');
            $table->char('source_sha256', 64)->index();
            $table->boolean('dry_run')->default(false);
            $table->string('status', 32)->index();
            $table->json('summary')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });

        Schema::create('legacy_import_records', function (Blueprint $table): void {
            $table->id();
            $table->string('entity', 32);
            $table->unsignedInteger('legacy_id');
            $table->string('local_type')->nullable();
            $table->unsignedBigInteger('local_id')->nullable();
            $table->foreignId('legacy_import_run_id')->nullable()->constrained('legacy_import_runs')->nullOnDelete();
            $table->char('payload_sha256', 64);
            $table->longText('raw_payload');
            $table->string('status', 32)->index();
            $table->json('messages')->nullable();
            $table->timestamps();

            $table->unique(['entity', 'legacy_id']);
            $table->index(['local_type', 'local_id']);
        });

        Schema::create('legacy_media_files', function (Blueprint $table): void {
            $table->id();
            $table->string('legacy_url', 1024);
            $table->char('legacy_url_sha256', 64)->unique();
            $table->char('content_sha256', 64)->nullable()->index();
            $table->unsignedBigInteger('media_id')->nullable()->index();
            $table->string('status', 32)->index();
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->string('error', 1024)->nullable();
            $table->unsignedBigInteger('bytes')->nullable();
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legacy_media_files');
        Schema::dropIfExists('legacy_import_records');
        Schema::dropIfExists('legacy_import_runs');
    }
};
