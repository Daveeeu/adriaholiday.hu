<?php

namespace App\Console\Commands;

use App\Services\Legacy\LegacyAdriaOfferCrawler;
use App\Services\Legacy\LegacyAdriaOfferParser;
use App\Services\Legacy\LegacyImportOutcome;
use App\Services\Legacy\LegacyTourImporter;
use App\Support\Legacy\LegacyOfferData;
use Illuminate\Console\Command;
use Throwable;

class AdriaImportOffersCommand extends Command
{
    protected $signature = 'adria:import-offers
        {--dry-run : Parse offers without writing to the database or downloading images}
        {--limit= : Limit the number of offers processed}
        {--slug= : Import a single offer by its legacy slug, skipping crawling}
        {--update-existing : Refresh tours that were already imported (matched by seo_name). Without this flag, existing tours are skipped.}';

    protected $description = 'Import tours, images and content from the legacy adriaholiday.hu website.';

    public function handle(
        LegacyAdriaOfferCrawler $crawler,
        LegacyAdriaOfferParser $parser,
        LegacyTourImporter $importer,
    ): int {
        $dryRun = (bool) $this->option('dry-run');
        $updateExisting = (bool) $this->option('update-existing');
        $limit = $this->option('limit') !== null ? max(0, (int) $this->option('limit')) : null;
        $slug = $this->option('slug');

        $offers = $slug !== null
            ? [$crawler->offerUrlForSlug($slug) => ['countries' => [], 'categories' => []]]
            : $crawler->discoverOfferUrls();

        if ($limit !== null) {
            $offers = array_slice($offers, 0, $limit, true);
        }

        $this->info(sprintf('Discovered %d offer%s to process.', count($offers), count($offers) === 1 ? '' : 's'));

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];

        foreach ($offers as $url => $context) {
            try {
                $html = $crawler->fetchHtml($url);
                $data = $parser->parse($html, $url, $context);
            } catch (Throwable $exception) {
                report($exception);
                $errors[$url] = $exception->getMessage();
                $this->error("Failed to fetch/parse {$url}: {$exception->getMessage()}");

                continue;
            }

            if ($dryRun) {
                $this->printDryRunSummary($data);

                continue;
            }

            try {
                $outcome = $importer->import($data, $updateExisting);
            } catch (Throwable $exception) {
                report($exception);
                $errors[$url] = $exception->getMessage();
                $this->error("Failed to import {$url}: {$exception->getMessage()}");

                continue;
            }

            match ($outcome) {
                LegacyImportOutcome::Created => $created++,
                LegacyImportOutcome::Updated => $updated++,
                LegacyImportOutcome::Skipped => $skipped++,
            };

            $this->line(sprintf('[%s] %s (%s)', strtoupper($outcome->value), $data->name, $data->seoName));
        }

        if (! $dryRun) {
            $this->newLine();
            $this->info('Import summary:');
            $this->table(['Metric', 'Count'], [
                ['Created', $created],
                ['Updated', $updated],
                ['Skipped (already exists)', $skipped],
                ['Gallery images downloaded (new, dedup reused not counted)', $importer->downloadedImageCount()],
                ['Errors', count($errors)],
            ]);

            if ($errors !== []) {
                $this->warn('Failed URLs:');

                foreach ($errors as $failedUrl => $message) {
                    $this->line("- {$failedUrl}: {$message}");
                }
            }
        }

        return $errors === [] ? self::SUCCESS : self::FAILURE;
    }

    private function printDryRunSummary(LegacyOfferData $data): void
    {
        $this->newLine();
        $this->line("<info>{$data->name}</info> ({$data->seoName})");
        $this->line(sprintf(
            '  dates=%d, program_days=%d, price_items=%d, gallery_images=%d, tags=%d, categories=%s, countries=%s, price=%s',
            count($data->dates),
            count($data->programDays),
            count($data->priceItems),
            count($data->galleryImageUrls),
            count($data->tags),
            $data->categories !== [] ? implode('/', $data->categories) : '-',
            $data->countrySlugs !== [] ? implode('/', $data->countrySlugs) : '-',
            $data->price !== null ? number_format($data->price, 0, ',', '.').' Ft' : '-',
        ));
    }
}
