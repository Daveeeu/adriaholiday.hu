<?php

namespace App\Services\Legacy\AdminExport;

use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportContext;
use App\Support\Legacy\AdminExport\LegacyAdminExportStepResult;

/**
 * One part of the legacy admin export import (customers, bookings, …). Steps
 * run in the order the import service lists them, so later steps can rely on
 * what earlier ones imported (e.g. bookings on tours).
 */
interface LegacyAdminExportStep
{
    /**
     * The name the --only option selects the step by.
     */
    public function key(): string;

    public function run(LegacyAdminExport $export, LegacyAdminExportContext $context): LegacyAdminExportStepResult;
}
