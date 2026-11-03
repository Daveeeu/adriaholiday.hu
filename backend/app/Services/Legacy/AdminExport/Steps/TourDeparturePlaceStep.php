<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\TourDeparturePlace;
use App\Services\Legacy\AdminExport\LegacyAdminExportStep;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportContext;
use App\Support\Legacy\AdminExport\LegacyAdminExportStepResult;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Legacy boarding points ("felszállási helyek") → departure places, by the
 * legacy id the tour import links them with. Runs before the tours so every
 * departure of a tour finds its place; places the office switched off stay off.
 */
final class TourDeparturePlaceStep implements LegacyAdminExportStep
{
    public function key(): string
    {
        return 'departure-places';
    }

    public function run(LegacyAdminExport $export, LegacyAdminExportContext $context): LegacyAdminExportStepResult
    {
        $result = new LegacyAdminExportStepResult($this->key());

        foreach ($export->records('roundtrip.felszallas') as $record) {
            $legacyId = $record->legacyId();
            $name = $record->field('name') ?? $record->listValue('Név');

            if ($legacyId === null || $name === null) {
                $result->count(LegacyAdminExportStepResult::SKIPPED);

                continue;
            }

            $place = TourDeparturePlace::withTrashed()->where('legacy_id', $legacyId)->first() ?? new TourDeparturePlace(['active' => true]);
            $place->fill([
                'name' => $name,
                'city' => $record->field('city') ?? $record->listValue('Város'),
                'fee' => (int) ($record->field('price') ?? $record->listValue('Díj') ?? 0),
            ]);
            $place->legacy_id = $legacyId;
            $outcome = ! $place->exists ? LegacyAdminExportStepResult::CREATED : ($place->isDirty() ? LegacyAdminExportStepResult::UPDATED : LegacyAdminExportStepResult::UNCHANGED);

            if (! $context->dryRun() && $outcome !== LegacyAdminExportStepResult::UNCHANGED) {
                try {
                    DB::transaction(fn () => $place->save());
                } catch (Throwable $exception) {
                    report($exception);
                    $result->failed($legacyId, $exception->getMessage());

                    continue;
                }
            }

            $result->count($outcome);
            $context->progress($this->key(), $legacyId, $outcome);
        }

        return $result;
    }
}
