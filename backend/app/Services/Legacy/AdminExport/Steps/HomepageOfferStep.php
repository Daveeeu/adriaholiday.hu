<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\HomepageOffer;
use App\Models\LegacyImportRecord;
use App\Services\Legacy\AdminExport\LegacyRecordRegistry;
use App\Services\Legacy\LegacyMediaMirror;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use App\Support\MediaCategory;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy home page boxes ("Főoldali ajánlatok") → homepage offers (their
 * Hungarian texts), adopting the offer of the same URL name when the office
 * already made it. New offers are imported switched off, so the live home
 * page only changes when the office decides.
 *
 * @extends RecordStep<HomepageOffer>
 */
final class HomepageOfferStep extends RecordStep
{
    public function __construct(LegacyRecordRegistry $registry, private readonly LegacyMediaMirror $media)
    {
        parent::__construct($registry);
    }

    public function key(): string
    {
        return 'homepage-offers';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::HOMEPAGE_OFFER;
    }

    protected function modelClass(): string
    {
        return HomepageOffer::class;
    }

    protected function sources(): array
    {
        return ['mainbox.mainbox'];
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $name = $record->field('name.hu') ?? $record->listValue('Név');

        if ($name === null) {
            return null;
        }

        $seoName = $record->field('seo_name.hu');
        $offer = $existing ?? ($seoName !== null ? HomepageOffer::withTrashed()->whereHas('translations', fn ($query) => $query->where('locale', 'hu')->where('seo_name', $seoName))->first() : null) ?? new HomepageOffer(['active' => false]);
        $this->fillFromLegacy($offer, [
            'sort_order' => (int) $record->field('order'),
            'image' => $this->image($export->fileUrl($record->field('image')), $name),
            'image_title' => $record->field('image_title') ?? $name,
            'link' => $this->sitePath($record->field('link') ?? $record->listValue('Link')),
        ], $existing !== null);
        $offer->save();

        $translation = $offer->translations()->firstOrNew(['locale' => 'hu']);
        $this->fillFromLegacy($translation, [
            'name' => $name,
            'seo_name' => $seoName,
            'short_description' => $record->field('short.hu'),
        ], $existing !== null);
        $translation->save();

        return $offer;
    }

    private function image(?string $url, string $title): ?string
    {
        if ($url === null || ! $this->copiesMedia()) {
            return null;
        }

        $this->media->mirror($url, ['alt' => $title, 'title' => $title, 'category' => MediaCategory::HOMEPAGE_OFFERS]);

        return $this->media->localUrl($url);
    }

    /**
     * Links to the legacy domain become site paths, which the legacy route
     * rules lead to their new address.
     */
    private function sitePath(?string $link): ?string
    {
        if ($link === null) {
            return null;
        }

        return preg_match('~^(?:https?:)?//(?:www\.)?adriaholiday\.hu(/.*)?$~i', $link, $match) ? ($match[1] ?? '/') : $link;
    }
}
