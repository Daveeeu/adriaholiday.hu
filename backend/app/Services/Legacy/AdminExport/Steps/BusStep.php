<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\Bus;
use App\Models\LegacyImportRecord;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy buses → buses (Hungarian name), by their number plate as vehicle
 * code ("Rendszám: NZB-791" in the legacy description), adopting the bus of
 * the same code when the office already made it. New buses are imported
 * switched off.
 *
 * @extends RecordStep<Bus>
 */
final class BusStep extends RecordStep
{
    public function key(): string
    {
        return 'buses';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::BUS;
    }

    protected function modelClass(): string
    {
        return Bus::class;
    }

    protected function sources(): array
    {
        return ['bus.bus'];
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $name = $record->field('name.hu') ?? $record->listValue('Név');
        $seoName = $record->field('seo_name.hu');
        $code = $this->numberPlate($record->field('short.hu')) ?? $seoName;

        if ($name === null || $code === null) {
            return null;
        }

        $bus = $existing ?? Bus::withTrashed()->where('vehicle_code', $code)->first() ?? new Bus(['active' => false]);
        $this->fillFromLegacy($bus, ['vehicle_code' => $code, 'sort_order' => (int) $record->field('order')], $existing !== null);
        $bus->save();

        $translation = $bus->translations()->firstOrNew(['locale' => 'hu']);
        $this->fillFromLegacy($translation, ['name' => $name, 'seo_name' => $seoName, 'seo_auto_generate' => false], $existing !== null);
        $translation->save();

        return $bus;
    }

    private function numberPlate(?string $html): ?string
    {
        $text = html_entity_decode(strip_tags((string) $html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return preg_match('/Rendszám:\s*([A-Z0-9\-]+)/u', $text, $match) ? $match[1] : null;
    }
}
