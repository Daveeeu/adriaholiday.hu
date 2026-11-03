<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Services\Legacy\AdminExport\LegacyAdminExportStep;
use App\Services\Legacy\LegacyBookingImporter;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportContext;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use App\Support\Legacy\AdminExport\LegacyAdminExportStepResult;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Legacy tour bookings → bookings, through the existing legacy booking
 * importer (it keeps the legacy id in the payload, matches tours and dates by
 * their legacy ids and never sends e-mails): this step only translates the
 * export's form fields into the record that importer reads.
 */
final class TourBookingStep implements LegacyAdminExportStep
{
    public function __construct(private readonly LegacyBookingImporter $importer) {}

    public function key(): string
    {
        return 'tour-bookings';
    }

    public function run(LegacyAdminExport $export, LegacyAdminExportContext $context): LegacyAdminExportStepResult
    {
        $result = new LegacyAdminExportStepResult($this->key());
        $departurePlaces = $export->recordsById('roundtrip.felszallas');

        foreach ($export->records('management.reservation') as $record) {
            try {
                $outcome = DB::transaction(fn () => $this->importer->import($this->bookingRecord($record, $departurePlaces), $context->dryRun()));
            } catch (Throwable $exception) {
                report($exception);
                $result->failed($record->legacyId(), $exception->getMessage());

                continue;
            }

            $counted = match ($outcome->outcome) {
                'invalid' => LegacyAdminExportStepResult::SKIPPED,
                'already_imported' => LegacyAdminExportStepResult::UNCHANGED,
                'updated' => LegacyAdminExportStepResult::UPDATED,
                default => LegacyAdminExportStepResult::CREATED,
            };
            $result->count($counted);
            $context->progress($this->key(), $record->legacyId(), $counted);

            if (in_array($counted, [LegacyAdminExportStepResult::CREATED, LegacyAdminExportStepResult::UPDATED], true) && ! $outcome->tourMatched) {
                $result->note("#{$record->legacyId()}: no tour found for \"{$outcome->offerName}\".");
            }
        }

        return $result;
    }

    /**
     * The record LegacyBookingImporter reads.
     *
     * @param  array<int, LegacyAdminExportRecord>  $departurePlaces  keyed by legacy id
     * @return array<string, mixed>
     */
    private function bookingRecord(LegacyAdminExportRecord $record, array $departurePlaces): array
    {
        $departureId = $record->selectedId('felszallas');

        return [
            'id' => $record->legacyId(),
            'position' => $record->field('position_number') ?? $record->listValue('Poziciószám'),
            'offerId' => $record->selectedId('offer_id'),
            'offerName' => $record->listValue('Ajánlat'),
            'offerDateId' => $record->selectedId('offer_date_id'),
            'offerDate' => $record->listValue('Időpont'),
            'customDate' => $record->field('custome_offer_date'),
            'departureId' => $departureId,
            'departure' => $departureId !== null ? $departurePlaces[$departureId]?->field('name') : null,
            'name' => $record->field('name') ?? $record->listValue('Név'),
            'email' => $record->field('email') ?? $record->listValue('Email'),
            'mobile' => $record->field('mobile'),
            'zip' => $record->field('zip'),
            'city' => $record->field('city'),
            'street' => $record->field('street'),
            'adults' => $record->field('nr_adults'),
            'passengers' => $record->field('passengers'),
            'canceled' => $record->listValue('Lemondott?') === 'Lemondott' ? '1' : '0',
            'price' => $record->field('reservation_price') ?? LegacyAdminExportRecord::amount($record->listValue('Foglalás értéke')),
            'message' => $record->field('message'),
            'description' => $record->field('description'),
            'createdAt' => $record->field('created_at') ?? $record->listValue('Jelentkezés időpontja'),
        ];
    }
}
