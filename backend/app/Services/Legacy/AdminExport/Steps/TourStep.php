<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Services\Legacy\AdminExport\LegacyAdminExportCatalogAdapter;
use App\Services\Legacy\AdminExport\LegacyAdminExportStep;
use App\Services\Legacy\Catalog\LegacyCatalogImportService;
use App\Services\Legacy\Catalog\LegacyCatalogPlanner;
use App\Services\Legacy\LegacyMediaMirror;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportContext;
use App\Support\Legacy\AdminExport\LegacyAdminExportStepResult;
use App\Support\Legacy\Catalog\LegacyCatalogOffer;

/**
 * Legacy offers (and the partner offers being organized) → tours, through the
 * existing legacy catalog import: dates, prices, seats, extras, departure
 * places, galleries and texts, keeping booked dates. Tours without a legacy
 * offer are never retired by this step.
 */
final class TourStep implements LegacyAdminExportStep
{
    public function __construct(
        private readonly LegacyAdminExportCatalogAdapter $adapter,
        private readonly LegacyCatalogImportService $catalog,
        private readonly LegacyMediaMirror $media,
    ) {}

    public function key(): string
    {
        return 'tours';
    }

    public function run(LegacyAdminExport $export, LegacyAdminExportContext $context): LegacyAdminExportStepResult
    {
        $result = new LegacyAdminExportStepResult($this->key());
        $catalog = $this->adapter->adapt($export);
        $prepared = $this->catalog->prepare($catalog);

        foreach ($prepared['catalog_errors'] as $error) {
            $result->note($error);
        }

        if ($context->dryRun()) {
            foreach ($prepared['offers'] as $legacyId => $entry) {
                $this->count($result, $legacyId, $entry['offer'] === null ? 'invalid' : $entry['plan']['action'], implode(' ', $entry['errors']));
            }

            return $result;
        }

        if ($context->mediaMode !== LegacyAdminExportContext::MEDIA_NONE) {
            $this->mirrorMedia($prepared['offers']);
        }

        $this->catalog->import($catalog, $prepared, false, false, function (int $legacyId, string $outcome, string $message) use ($result, $context): void {
            $this->count($result, $legacyId, $outcome, $message);
            $context->progress($this->key(), $legacyId, $outcome);
        });

        return $result;
    }

    /**
     * The catalog import only links files copied before; they are copied now.
     *
     * @param  array<int, array<string, mixed>>  $offers
     */
    private function mirrorMedia(array $offers): void
    {
        $baseUrl = (string) config('services.legacy_adria.base_url');

        foreach ($offers as $entry) {
            if ($entry['offer'] instanceof LegacyCatalogOffer) {
                foreach ($entry['offer']->mediaUrls($baseUrl) as $url) {
                    $this->media->mirror($url);
                }
            }
        }
    }

    private function count(LegacyAdminExportStepResult $result, int $legacyId, string $outcome, string $message): void
    {
        match ($outcome) {
            LegacyCatalogPlanner::CREATE => $result->count(LegacyAdminExportStepResult::CREATED),
            LegacyCatalogPlanner::UPDATE, LegacyCatalogPlanner::ADOPT => $result->count(LegacyAdminExportStepResult::UPDATED),
            LegacyCatalogPlanner::UNCHANGED, 'skipped' => $result->count(LegacyAdminExportStepResult::UNCHANGED),
            LegacyCatalogPlanner::CONFLICT => $this->skip($result, $legacyId, $message),
            default => $result->failed($legacyId, $message),
        };
    }

    private function skip(LegacyAdminExportStepResult $result, int $legacyId, string $message): void
    {
        $result->count(LegacyAdminExportStepResult::SKIPPED);
        $result->note("#{$legacyId}: {$message}");
    }
}
