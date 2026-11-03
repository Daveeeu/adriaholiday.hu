<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Services\Legacy\AdminExport\LegacyAdminExportStep;
use App\Services\Legacy\LegacyImportOutcome;
use App\Services\Legacy\LegacyTestimonialImporter;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportContext;
use App\Support\Legacy\AdminExport\LegacyAdminExportStepResult;

/**
 * Legacy guest letters ("Rólunk írták") → testimonials, through the existing
 * legacy testimonial importer.
 */
final class TestimonialStep implements LegacyAdminExportStep
{
    public function __construct(private readonly LegacyTestimonialImporter $importer) {}

    public function key(): string
    {
        return 'testimonials';
    }

    public function run(LegacyAdminExport $export, LegacyAdminExportContext $context): LegacyAdminExportStepResult
    {
        $result = new LegacyAdminExportStepResult($this->key());

        foreach ($export->records('aboutus.rolunkirtak') as $record) {
            $outcome = $this->importer->import([
                'id' => $record->legacyId(),
                'title' => $record->field('title') ?? $record->listValue('Név'),
                'intro' => $record->field('intro'),
                'createdAt' => $record->field('created_at') ?? $record->listValue('Dátum'),
            ], $context->dryRun());

            $counted = match ($outcome) {
                false => LegacyAdminExportStepResult::SKIPPED,
                LegacyImportOutcome::Skipped => LegacyAdminExportStepResult::UNCHANGED,
                default => LegacyAdminExportStepResult::CREATED,
            };
            $result->count($counted);
            $context->progress($this->key(), $record->legacyId(), $counted);
        }

        return $result;
    }
}
