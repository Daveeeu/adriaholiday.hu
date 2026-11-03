<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\LegacyImportRecord;
use App\Models\TourSeasonalGroup;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy seasonal offer groups ("Szezonális ajánlat csoportok") → tour
 * seasonal groups, adopting the group of the same URL name when the office
 * already made it. New groups are imported switched off.
 *
 * @extends RecordStep<TourSeasonalGroup>
 */
final class TourSeasonalGroupStep extends RecordStep
{
    public function key(): string
    {
        return 'tour-seasonal-groups';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::TOUR_SEASONAL_GROUP;
    }

    protected function modelClass(): string
    {
        return TourSeasonalGroup::class;
    }

    protected function sources(): array
    {
        return ['roundtrip.offer_group'];
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $name = $record->field('name') ?? $record->listValue('Név');

        if ($name === null) {
            return null;
        }

        $seoName = $record->field('seo_name');
        $group = $existing ?? ($seoName !== null ? TourSeasonalGroup::withTrashed()->where('seo_name', $seoName)->first() : null) ?? new TourSeasonalGroup(['active' => false]);
        $this->fillFromLegacy($group, [
            'menu_type' => $record->listValue('Menü') ?? 'Utazási ajánlatok',
            'name' => $name,
            'seo_name' => $seoName,
            'seo_auto_generate' => false,
            'box_text' => $record->field('short_description'),
            'has_offers' => $record->listValue('Árajánlatos utak?') === 'Igen',
        ], $existing !== null);
        $group->save();

        return $group;
    }
}
