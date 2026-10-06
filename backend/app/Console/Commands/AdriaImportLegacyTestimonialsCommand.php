<?php

namespace App\Console\Commands;

use App\Models\Testimonial;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AdriaImportLegacyTestimonialsCommand extends Command
{
    protected $signature = 'adria:import-legacy-testimonials
        {path : JSON file with the "Rólunk írták" entries exported from the legacy admin}
        {--dry-run : Report what would be imported without writing anything}';

    protected $description = 'Import the guest letters ("Rólunk írták") exported from the legacy adriaholiday.hu admin; entries already imported are skipped.';

    /**
     * A closing paragraph this short is the letter's signature (e.g. "B Istvánné").
     */
    private const SIGNATURE_MAX_LENGTH = 40;

    public function handle(): int
    {
        $records = json_decode((string) @file_get_contents((string) $this->argument('path')), true);

        if (! is_array($records)) {
            $this->error('The file is missing or is not a JSON array of entries.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $imported = 0;
        $skipped = 0;
        $invalid = 0;

        DB::transaction(function () use ($records, $dryRun, &$imported, &$skipped, &$invalid): void {
            foreach ($records as $record) {
                $legacyId = (int) ($record['id'] ?? 0);
                $title = trim((string) ($record['title'] ?? ''));
                $body = trim((string) ($record['content'] ?? '') ?: (string) ($record['intro'] ?? ''));

                if ($legacyId <= 0 || $title === '' || $body === '') {
                    $invalid++;

                    continue;
                }

                if (Testimonial::query()->where('legacy_id', $legacyId)->exists()) {
                    $skipped++;

                    continue;
                }

                if (! $dryRun) {
                    Testimonial::query()->create([
                        'legacy_id' => $legacyId,
                        'title' => $title,
                        'author' => $this->signature($body),
                        'body' => $body,
                        'published_at' => $this->publishedAt((string) ($record['createdAt'] ?? ''), $title),
                        'active' => true,
                    ]);
                }

                $imported++;
            }
        });

        $this->info($dryRun ? 'Dry run – nothing was written.' : 'Import finished.');
        $this->table(['Result', 'Count'], [
            [$dryRun ? 'Would import' : 'Imported', $imported],
            ['Already imported (skipped)', $skipped],
            ['Invalid (skipped)', $invalid],
        ]);

        return self::SUCCESS;
    }

    private function signature(string $body): ?string
    {
        preg_match_all('/<p[^>]*>(.*?)<\/p>/is', $body, $matches);
        $last = trim((string) html_entity_decode(strip_tags((string) end($matches[1])), ENT_QUOTES | ENT_HTML5, 'UTF-8'));

        return $last !== '' && mb_strlen($last) <= self::SIGNATURE_MAX_LENGTH && ! preg_match('/[.!?]$/u', $last) ? $last : null;
    }

    /**
     * Some legacy entries carry a date in the future (e.g. 2030); those are dated by
     * the trip date in their title ("… 2023.01.28.") so they keep their place in time.
     */
    private function publishedAt(string $value, string $title): CarbonImmutable
    {
        $date = preg_match('/^\d{4}-\d{2}-\d{2}/', $value) ? CarbonImmutable::parse($value) : null;

        if ($date !== null && ! $date->isFuture()) {
            return $date;
        }

        return preg_match('/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/', $title, $match)
            ? CarbonImmutable::create((int) $match[1], (int) $match[2], (int) $match[3])
            : CarbonImmutable::now();
    }
}
