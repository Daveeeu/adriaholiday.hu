<?php

namespace App\Console\Commands;

use App\Models\LegacyMediaFile;
use App\Services\Legacy\Catalog\LegacyCatalogOfferMapper;
use App\Services\Legacy\Catalog\LegacyCatalogReader;
use App\Services\Legacy\Catalog\LegacyCatalogReport;
use App\Services\Legacy\Catalog\LegacyCatalogValidator;
use App\Services\Legacy\LegacyMediaMirror;
use App\Support\Legacy\Catalog\LegacyCatalogException;
use Illuminate\Console\Command;

class LegacyCatalogMediaCommand extends Command
{
    protected $signature = 'adria:catalog:media
        {file : The legacy catalog export (adriaholiday-all-offers.json)}
        {--check : Only check that every file can be downloaded (HTTP HEAD), store nothing}
        {--only=* : Only the offers with these legacy ids (repeatable)}';

    protected $description = 'Copy the images and PDFs of the legacy offer catalog into the media library (run before adria:catalog:import; safe to re-run).';

    public function handle(
        LegacyCatalogReader $reader,
        LegacyCatalogValidator $validator,
        LegacyCatalogOfferMapper $mapper,
        LegacyMediaMirror $mirror,
        LegacyCatalogReport $report,
    ): int {
        try {
            $catalog = $reader->read((string) $this->argument('file'));
        } catch (LegacyCatalogException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $only = array_map('intval', (array) $this->option('only'));
        $legacyBaseUrl = (string) config('services.legacy_adria.base_url');
        $boardingPoints = $catalog->boardingPoints();
        $urls = [];

        foreach ($catalog->offers as $offer) {
            if ($validator->offerIssues($offer, $boardingPoints)['errors'] !== [] || ($only !== [] && ! in_array($offer['legacy_id'], $only, true))) {
                continue;
            }

            $mapped = $mapper->map($offer, today());

            foreach ($mapped->mediaUrls($legacyBaseUrl) as $url) {
                $urls[$url][] = $mapped->legacyId;
            }
        }

        $check = (bool) $this->option('check');
        $rows = [];
        $bar = $this->output->createProgressBar(count($urls));

        foreach ($urls as $url => $legacyIds) {
            if ($check) {
                $mirrored = LegacyMediaFile::query()->forUrl($url)->where('status', LegacyMediaFile::MIRRORED)->exists();
                $result = $mirrored ? ['ok' => true, 'http_status' => null, 'error' => null] : $mirror->check($url);
                $status = $mirrored ? 'mirrored' : ($result['ok'] ? 'available' : 'unavailable');
                $error = $result['error'];
            } else {
                $file = $mirror->mirror($url);
                $status = $file->status;
                $error = $file->error;
            }

            $rows[] = ['url' => $url, 'status' => $status, 'error' => $error, 'legacy_ids' => array_values(array_unique($legacyIds))];
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $counts = collect($rows)->countBy('status')->all();
        $problems = collect($rows)->whereIn('status', ['unavailable', LegacyMediaFile::FAILED])->values();
        $summary = [
            'mode' => $check ? 'check' : 'mirror',
            'files' => count($rows),
            'by_status' => $counts,
            'downloaded' => $mirror->downloadCount(),
            'problems' => $problems->count(),
        ];
        $paths = $report->write($check ? 'media-check' : 'media-mirror', $summary, $rows, ['url', 'status', 'error', 'legacy_ids']);

        $this->table(['Status', 'Files'], collect($counts)->map(fn (int $count, string $status): array => [$status, $count])->values()->all());

        foreach ($problems as $problem) {
            $this->warn(sprintf('%s: %s (offers %s)', $problem['url'], $problem['error'], implode(', ', $problem['legacy_ids'])));
        }

        $this->info("Report: {$paths['json']}");

        return $problems->isEmpty() ? self::SUCCESS : self::FAILURE;
    }
}
