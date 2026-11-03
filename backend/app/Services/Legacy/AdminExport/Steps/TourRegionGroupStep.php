<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\LegacyImportRecord;
use App\Models\TourRegionGroup;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy tour regions and groups ("Régiók és csoportok") → tour region groups,
 * adopting the group of the same URL name when the office already made it.
 * New groups are imported switched off, for the office to review.
 *
 * @extends RecordStep<TourRegionGroup>
 */
final class TourRegionGroupStep extends RecordStep
{
    public function key(): string
    {
        return 'tour-region-groups';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::TOUR_REGION_GROUP;
    }

    protected function modelClass(): string
    {
        return TourRegionGroup::class;
    }

    protected function sources(): array
    {
        return ['roundtrip.region'];
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $name = $record->field('name') ?? $record->listValue('Név');

        if ($name === null) {
            return null;
        }

        $seoName = $record->field('seo_name');
        $group = $existing ?? ($seoName !== null ? TourRegionGroup::withTrashed()->where('seo_name', $seoName)->first() : null) ?? new TourRegionGroup(['active' => false]);
        $this->fillFromLegacy($group, [
            'type' => $record->listValue('Típus') ?? 'Régió',
            'name' => $name,
            'seo_name' => $seoName,
            'seo_auto_generate' => false,
            'featured_on_homepage' => $record->listValue('Főoldalra kiemelt?') === 'Igen',
            'description' => $record->field('description'),
        ], $existing !== null);
        $group->save();

        return $group;
    }
}
