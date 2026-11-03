<?php

namespace App\Support\Legacy\AdminExport;

use App\Models\LegacyImportRun;
use App\Services\Legacy\Apartments\LegacyApartmentImporter;
use Closure;

/**
 * The run a step of the legacy admin export import belongs to: none on a dry
 * run, when nothing is written.
 */
final readonly class LegacyAdminExportContext
{
    /** Copy the images of every imported record. */
    public const MEDIA_ALL = LegacyApartmentImporter::MEDIA_ALL;

    /** Copy the apartment images only for the apartments the legacy site lists. */
    public const MEDIA_LISTED = LegacyApartmentImporter::MEDIA_LISTED;

    /** Copy no images (they can be copied by a later run). */
    public const MEDIA_NONE = LegacyApartmentImporter::MEDIA_NONE;

    public const MEDIA_MODES = [self::MEDIA_ALL, self::MEDIA_LISTED, self::MEDIA_NONE];

    /**
     * @param  Closure(string, ?int, string): void  $progress  step, legacy id, outcome
     */
    public function __construct(
        public ?LegacyImportRun $run,
        public string $mediaMode,
        private Closure $progress,
    ) {}

    public function dryRun(): bool
    {
        return $this->run === null;
    }

    public function progress(string $step, ?int $legacyId, string $outcome): void
    {
        ($this->progress)($step, $legacyId, $outcome);
    }
}
