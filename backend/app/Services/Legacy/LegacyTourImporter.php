<?php

namespace App\Services\Legacy;

use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use App\Services\Tour\TourContentSyncService;
use App\Support\Legacy\LegacyCountryDictionary;
use App\Support\Legacy\LegacyOfferData;
use App\Support\PublicContentCache;
use App\Support\RichTextSanitizer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Upserts a Tour (and its dates, program days, gallery, price items,
 * departure places, region/country/category/tag/travel-mode links) from a
 * parsed LegacyOfferData, reusing TourContentSyncService so imported tours
 * are persisted through the exact same rules as admin-edited tours.
 */
class LegacyTourImporter
{
    public function __construct(
        private readonly LegacyMediaImporter $mediaImporter,
        private readonly TourContentSyncService $tourContentSync,
    ) {}

    /**
     * Number of gallery images actually downloaded (not reused from a prior
     * import) since this instance was created.
     */
    public function downloadedImageCount(): int
    {
        return $this->mediaImporter->downloadCount();
    }

    public function import(LegacyOfferData $data, bool $updateExisting): LegacyImportOutcome
    {
        $existing = Tour::withTrashed()->where('seo_name', $data->seoName)->first();

        if ($existing !== null && ! $updateExisting) {
            return LegacyImportOutcome::Skipped;
        }

        // Network I/O happens before the transaction so a failed download never
        // leaves an open DB transaction hanging.
        $galleryMedia = $this->importGalleryImages($data);

        $regionId = $this->resolveRegionId($data->countrySlugs);
        $countryIds = $this->resolveCountryCodes($data->countrySlugs);
        $categoryIds = $this->resolveReferenceOptionCodes('category', $data->categories);
        $tagIds = $this->resolveReferenceOptionCodes('tag', $data->tags);
        $travelModeId = $data->travelModeCode !== null ? $this->resolveTravelMode($data->travelModeCode) : null;
        $departurePlaceIds = $this->resolveDeparturePlaceIds($data->departurePlaceNames);

        DB::transaction(function () use ($data, $existing, $galleryMedia, $regionId, $countryIds, $categoryIds, $tagIds, $travelModeId, $departurePlaceIds): void {
            $tour = $existing ?? new Tour;

            if ($existing?->trashed()) {
                $existing->restore();
            }

            if ($existing === null) {
                $tour->active = true;
            }

            $tour->fill([
                'name' => $data->name,
                'seo_name' => $data->seoName,
                'short_description' => RichTextSanitizer::sanitize($data->shortDescription),
                'notes' => RichTextSanitizer::sanitize($data->notesHtml),
                'discounts' => RichTextSanitizer::sanitize($data->discountsHtml),
                'region_id' => $regionId,
                'travel_mode_id' => $travelModeId,
                'catering' => $data->catering,
                'accommodation' => $data->accommodation,
                'country_ids' => $countryIds,
                'category_ids' => $categoryIds,
                'tag_ids' => $tagIds,
                'price' => $data->price,
                'displayed_price' => $data->price !== null ? number_format($data->price, 0, ',', '.').' Ft' : null,
            ]);
            $tour->save();

            $this->tourContentSync->syncDates($tour, array_map(static fn (array $date): array => [
                'start_date' => $date['start_date'],
                'end_date' => $date['end_date'],
                'price' => $date['price'],
                'price_box_price' => $date['price'],
                'status' => 'planned',
            ], $data->dates));

            $this->tourContentSync->syncProgramDays($tour, $data->programDays);

            $this->tourContentSync->syncGalleryItems($tour, collect($galleryMedia)
                ->values()
                ->map(fn (Media $media, int $index): array => [
                    'media_id' => $media->id,
                    'alt' => $data->name,
                    'sort_order' => $index + 1,
                ])
                ->all());

            $this->tourContentSync->syncPriceItems($tour, $data->priceItems);

            $tour->departurePlaces()->sync($departurePlaceIds);
        });

        PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PORTFOLIO_FILTERS, PublicContentCache::SITEMAP);

        return $existing !== null ? LegacyImportOutcome::Updated : LegacyImportOutcome::Created;
    }

    /**
     * @return array<int, Media>
     */
    private function importGalleryImages(LegacyOfferData $data): array
    {
        $media = [];

        foreach ($data->galleryImageUrls as $index => $url) {
            try {
                $media[] = $this->mediaImporter->importImage($url, [
                    'alt' => $data->name,
                    'title' => $data->name.' — '.($index + 1),
                ]);
            } catch (LegacyFetchException $exception) {
                report($exception);
            }
        }

        return $media;
    }

    /**
     * @param  array<int, string>  $countrySlugs
     */
    private function resolveRegionId(array $countrySlugs): ?int
    {
        foreach ($countrySlugs as $slug) {
            $regionSlug = LegacyCountryDictionary::resolve($slug)['region_slug'];

            if ($regionSlug === null) {
                continue;
            }

            $region = Region::query()->where('slug', $regionSlug)->first();

            if ($region !== null) {
                return $region->id;
            }
        }

        return null;
    }

    /**
     * @param  array<int, string>  $countrySlugs
     * @return array<int, string>
     */
    private function resolveCountryCodes(array $countrySlugs): array
    {
        $codes = [];

        foreach ($countrySlugs as $slug) {
            $info = LegacyCountryDictionary::resolve($slug);
            $this->firstOrCreateReferenceOption('country', $info['code'], $info['name']);
            $codes[] = $info['code'];
        }

        return array_values(array_unique($codes));
    }

    /**
     * @param  array<int, string>  $names
     * @return array<int, string>
     */
    private function resolveReferenceOptionCodes(string $type, array $names): array
    {
        $codes = [];

        foreach ($names as $name) {
            $name = trim($name);
            $code = Str::slug($name);

            if ($code === '') {
                continue;
            }

            $this->firstOrCreateReferenceOption($type, $code, $name);
            $codes[] = $code;
        }

        return array_values(array_unique($codes));
    }

    private function resolveTravelMode(string $code): string
    {
        $names = ['bus' => 'Busz', 'plane' => 'Repülő', 'train' => 'Vonat'];
        $this->firstOrCreateReferenceOption('travel-mode', $code, $names[$code] ?? Str::headline($code));

        return $code;
    }

    /**
     * @param  array<int, string>  $names
     * @return array<int, int>
     */
    private function resolveDeparturePlaceIds(array $names): array
    {
        $ids = [];

        foreach ($names as $name) {
            $name = trim($name);

            if ($name === '') {
                continue;
            }

            $place = TourDeparturePlace::query()->firstOrCreate(
                ['name' => $name],
                ['active' => true],
            );
            $ids[] = $place->id;
        }

        return array_values(array_unique($ids));
    }

    private function firstOrCreateReferenceOption(string $type, string $code, string $name): void
    {
        TourReferenceOption::query()->firstOrCreate(
            ['type' => $type, 'code' => $code],
            ['name' => $name, 'active' => true, 'sort_order' => 0],
        );
    }
}
