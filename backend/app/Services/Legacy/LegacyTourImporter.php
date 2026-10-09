<?php

namespace App\Services\Legacy;

use App\Models\BlogCategory;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use App\Services\Tour\TourContentSyncService;
use App\Support\Legacy\LegacyCountryDictionary;
use App\Support\Legacy\LegacyOfferData;
use App\Support\PublicContentCache;
use App\Support\RichTextSanitizer;
use App\Support\TourSearchIndex;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Upserts a Tour (and its dates with their extras, program days, gallery, price items,
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
        $categoryIds = $this->resolveCategoryIds($data->categories);
        $tagIds = $this->resolveReferenceOptionCodes('tag', $data->tags);
        $travelModeId = $data->travelModeCode !== null ? $this->resolveTravelMode($data->travelModeCode) : $existing?->travel_mode_id;
        // Once every date is closed for booking the legacy site offers no departure
        // places, only a free-text list of towns: keep what the tour already has.
        $syncDeparturePlaces = $existing === null || $this->isBookable($data);
        $departurePlaceIds = $syncDeparturePlaces ? $this->resolveDeparturePlaceIds($data->departurePlaceNames) : [];
        $departurePlaceFees = collect($data->departurePlaceFees)
            ->filter(fn (float $fee, string $name): bool => isset($departurePlaceIds[trim($name)]))
            ->mapWithKeys(fn (float $fee, string $name): array => [$departurePlaceIds[trim($name)] => $fee])
            ->all();

        DB::transaction(function () use ($data, $existing, $galleryMedia, $regionId, $countryIds, $categoryIds, $tagIds, $travelModeId, $syncDeparturePlaces, $departurePlaceIds, $departurePlaceFees): void {
            $tour = $existing ?? new Tour;

            if ($existing?->trashed()) {
                $existing->restore();
            }

            if ($existing === null) {
                $tour->active = true;
                // Every legacy tour accepted the e-mail coupon.
                $tour->couponable = true;
            }

            $tour->fill([
                'name' => $data->name,
                'subtitle' => $data->subtitle,
                'teaser' => $data->teaserHtml,
                'tickets' => $data->ticketsHtml,
                'optional_programs' => $data->optionalProgramsHtml,
                'seo_name' => $data->seoName,
                'short_description' => RichTextSanitizer::sanitize($data->shortDescription),
                'notes' => RichTextSanitizer::sanitize($data->notesHtml),
                'discounts' => RichTextSanitizer::sanitize($data->discountsHtml),
                'travel_mode_id' => $travelModeId,
                'catering' => $data->catering ?? $existing?->catering,
                'accommodation' => $data->accommodation ?? $existing?->accommodation,
                'tag_ids' => $tagIds,
                'price' => $data->price,
                'displayed_price' => $data->price !== null ? number_format($data->price, 0, ',', '.').' Ft' : null,
            ]);

            // Countries come from the crawl context, which an offer missing from
            // every listing page lacks; an update must not wipe the ones the tour
            // already has.
            if ($data->countrySlugs !== [] || $existing === null) {
                $tour->fill(['region_id' => $regionId, 'country_ids' => $countryIds]);
            }

            // The legacy site only knows its own tour groups, so categories added
            // on the new site (e.g. "Repülős körutazások") survive an update.
            $tour->fill(['category_ids' => array_values(array_unique([
                ...($existing?->category_ids ?? []),
                ...$categoryIds,
            ]))]);

            // A new tour starts with the places its short description lists;
            // keywords the office edited are never overwritten.
            if ($existing === null) {
                $tour->search_keywords = TourSearchIndex::suggestKeywords($tour);
            }

            $tour->save();

            $this->tourContentSync->syncDates($tour, array_map(fn (array $date): array => [
                'start_date' => $date['start_date'],
                'end_date' => $date['end_date'],
                'price' => $date['price'],
                'price_box_price' => $date['price'],
                'price_box_original_price' => $date['original_price'] ?? null,
                'price_box_discount_badge' => $date['discount_badge'] ?? null,
                'price_box_label' => $date['label'] ?? null,
                // Availability follows the legacy site (see reopenDatesBookableAgain());
                // any other status is the admin's.
                ...(($date['sold_out'] ?? false) ? ['status' => 'sold_out'] : []),
                // A date closed for booking has unknown extras: keep the stored ones.
                ...($date['extras'] !== null ? ['extras' => $date['extras']] : []),
            ], $data->dates), keepDeparted: true);

            $this->reopenDatesBookableAgain($tour, $data);

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

            if ($syncDeparturePlaces) {
                $this->tourContentSync->syncDeparturePlaces($tour, array_values($departurePlaceIds), $departurePlaceFees);
            }
        });

        PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PORTFOLIO_FILTERS, PublicContentCache::PORTFOLIO_COUNTRIES, PublicContentCache::SITEMAP);

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

    /**
     * Tour categories are the portfolio (blog) categories the offer listing pages filter by.
     *
     * @param  array<int, string>  $names
     * @return array<int, string> category ids
     */
    private function resolveCategoryIds(array $names): array
    {
        return collect($names)
            ->map(fn (string $name): string => trim($name))
            ->filter(fn (string $name): bool => Str::slug($name) !== '')
            ->map(fn (string $name): string => (string) BlogCategory::firstOrCreateForName($name)->id)
            ->unique()
            ->values()
            ->all();
    }

    private function resolveTravelMode(string $code): string
    {
        $names = ['bus' => 'Busz', 'plane' => 'Repülő', 'train' => 'Vonat'];
        $this->firstOrCreateReferenceOption('travel-mode', $code, $names[$code] ?? Str::headline($code));

        return $code;
    }

    /**
     * @param  array<int, string>  $names
     * @return array<string, int> departure place id keyed by name
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
            $ids[$name] = $place->id;
        }

        return $ids;
    }

    private function firstOrCreateReferenceOption(string $type, string $code, string $name): void
    {
        TourReferenceOption::query()->firstOrCreate(
            ['type' => $type, 'code' => $code],
            ['name' => $name, 'active' => true, 'sort_order' => 0],
        );
    }

    private function isBookable(LegacyOfferData $data): bool
    {
        return collect($data->dates)->contains(fn (array $date): bool => $date['legacy_id'] !== null);
    }

    /**
     * A date sold out earlier that the legacy site takes bookings for again
     * (it has a booking button and no "Betelt" mark) is bookable again.
     */
    private function reopenDatesBookableAgain(Tour $tour, LegacyOfferData $data): void
    {
        foreach ($data->dates as $date) {
            if ($date['legacy_id'] === null || ($date['sold_out'] ?? false)) {
                continue;
            }

            $tour->dates()
                ->whereDate('start_date', (string) $date['start_date'])
                ->whereDate('end_date', (string) $date['end_date'])
                ->where('status', 'sold_out')
                ->update(['status' => 'planned']);
        }
    }
}
