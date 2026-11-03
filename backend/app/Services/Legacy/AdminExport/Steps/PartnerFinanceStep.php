<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\LegacyImportRecord;
use App\Models\PartnerFinanceRecord;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy partner finance entries (referral credits and their payouts) →
 * partner finance records. The legacy list view holds every field.
 *
 * @extends RecordStep<PartnerFinanceRecord>
 */
final class PartnerFinanceStep extends RecordStep
{
    public function key(): string
    {
        return 'partner-finances';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::PARTNER_FINANCE;
    }

    protected function modelClass(): string
    {
        return PartnerFinanceRecord::class;
    }

    protected function sources(): array
    {
        return ['management.reservation_finances'];
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $partner = $record->listValue('Partner');
        $amount = LegacyAdminExportRecord::amount($record->listValue('Érték'));

        if ($partner === null || $amount === null) {
            return null;
        }

        $entry = $existing ?? new PartnerFinanceRecord;
        $entry->fill([
            'partner_name' => $partner,
            'date' => LegacyAdminExportRecord::dateTime($record->listValue('Teljesítés dátum') ?? $record->listValue('Kérés dátum'))?->toDateString(),
            'amount' => $amount,
            'type' => $record->listValue('Típus') ?? '-',
            'status' => $record->listValue('Státusz') ?? '-',
            'balance' => LegacyAdminExportRecord::amount($record->listValue('Egyenleg')),
            'note' => $record->listValue('Esemény'),
        ])->save();

        return $entry;
    }
}
