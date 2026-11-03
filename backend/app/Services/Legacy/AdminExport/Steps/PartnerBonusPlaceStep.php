<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\LegacyImportRecord;
use App\Models\PartnerFinanceRecord;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy bonus places (a free seat a partner earned on a tour) → partner
 * finance records, the tour, its date and the seat kept in the note.
 *
 * @extends RecordStep<PartnerFinanceRecord>
 */
final class PartnerBonusPlaceStep extends RecordStep
{
    public function key(): string
    {
        return 'partner-bonus-places';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::PARTNER_BONUS_PLACE;
    }

    protected function modelClass(): string
    {
        return PartnerFinanceRecord::class;
    }

    protected function sources(): array
    {
        return ['management.reservation_bonus_place'];
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $partner = $record->listValue('Partner');

        if ($partner === null) {
            return null;
        }

        $place = $record->listValue('Hely');
        $entry = $existing ?? new PartnerFinanceRecord;
        $entry->fill([
            'partner_name' => $partner,
            'date' => LegacyAdminExportRecord::dateTime($record->listValue('Teljesítés dátum') ?? $record->listValue('Bekerülés dátum'))?->toDateString(),
            'amount' => LegacyAdminExportRecord::amount($record->listValue('Érték')) ?? 0,
            'type' => 'Jutalomhely'.(($type = $record->listValue('Típus')) !== null ? " ({$type})" : ''),
            'status' => $record->listValue('Státusz') ?? '-',
            'note' => implode(', ', array_filter([
                $record->listValue('Utazás'),
                $record->listValue('Időpont'),
                $place !== null ? "hely: {$place}" : null,
            ])) ?: null,
        ])->save();

        return $entry;
    }
}
