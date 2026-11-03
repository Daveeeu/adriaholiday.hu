<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Services\Legacy\AdminExport\LegacyAdminExportApartmentAdapter;
use App\Services\Legacy\AdminExport\LegacyAdminExportStep;
use App\Services\Legacy\Apartments\LegacyApartmentImporter;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportContext;
use App\Support\Legacy\AdminExport\LegacyAdminExportStepResult;

/**
 * Every legacy apartment list (Italian, Greek, Bulgarian, Montenegrin,
 * Croatian) → apartments, through the existing legacy apartment import: each
 * becomes or updates the apartment of its legacy id, with its places,
 * regions, prices and gallery. Apartments without a legacy id stay as they are.
 */
final class ApartmentStep implements LegacyAdminExportStep
{
    public function __construct(
        private readonly LegacyAdminExportApartmentAdapter $adapter,
        private readonly LegacyApartmentImporter $importer,
    ) {}

    public function key(): string
    {
        return 'apartments';
    }

    public function run(LegacyAdminExport $export, LegacyAdminExportContext $context): LegacyAdminExportStepResult
    {
        $result = new LegacyAdminExportStepResult($this->key());
        $imported = $this->importer->import(
            $this->adapter->adapt($export),
            $context->dryRun(),
            $context->mediaMode,
            false,
            fn (int $legacyId, string $action) => $context->progress($this->key(), $legacyId, $action),
        );

        foreach ($imported['rows'] as $row) {
            match ($row['action']) {
                LegacyApartmentImporter::CREATE => $result->count(LegacyAdminExportStepResult::CREATED),
                LegacyApartmentImporter::UPDATE => $result->count(LegacyAdminExportStepResult::UPDATED),
                LegacyApartmentImporter::SKIPPED_DELETED => $result->count(LegacyAdminExportStepResult::SKIPPED),
                LegacyApartmentImporter::CONFLICT => $this->skip($result, $row),
                default => $result->failed($row['legacy_id'], "{$row['name']}: ".implode(' ', $row['messages'])),
            };
        }

        return $result;
    }

    /**
     * A conflict (no place, or a URL another apartment holds) needs the
     * office's decision; it is reported, not counted as a failure.
     *
     * @param  array<string, mixed>  $row
     */
    private function skip(LegacyAdminExportStepResult $result, array $row): void
    {
        $result->count(LegacyAdminExportStepResult::SKIPPED);
        $result->note("#{$row['legacy_id']} {$row['name']}: ".implode(' ', $row['messages']));
    }
}
