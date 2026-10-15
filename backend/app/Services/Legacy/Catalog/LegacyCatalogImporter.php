<?php

namespace App\Services\Legacy\Catalog;

use App\Models\BlogCategory;
use App\Models\LegacyImportRecord;
use App\Models\LegacyImportRun;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourGalleryItem;
use App\Models\TourReferenceOption;
use App\Services\Legacy\LegacyMediaMirror;
use App\Services\Legacy\LegacyReferenceResolver;
use App\Services\Tour\TourContentSyncService;
use App\Support\Legacy\Catalog\LegacyCatalogOffer;
use App\Support\Legacy\LegacyHtmlContent;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\TourSearchIndex;
use Illuminate\Support\Facades\DB;

/**
 * Writes one legacy offer of the catalog to the site, in one transaction:
 * the tour (created, or the existing one updated in place so its bookings
 * keep pointing at it), its dates with their extras and departure places,
 * galleries, partner bonuses and links to categories and countries, all
 * through TourContentSyncService like admin edits. The offer's original
 * JSON is kept in legacy_import_records. Media must have been mirrored
 * before (adria:catalog:media); a missing file is left out and reported.
 *
 * @phpstan-import-type CatalogDate from LegacyCatalogOffer
 * @phpstan-import-type CatalogImage from LegacyCatalogOffer
 */
final class LegacyCatalogImporter
{
    public function __construct(
        private readonly TourContentSyncService $tourContentSync,
        private readonly LegacyReferenceResolver $references,
        private readonly LegacyTaxonomyResolver $taxonomy,
        private readonly LegacyMediaMirror $media,
    ) {}

    /**
     * @param  array<string, mixed>  $rawOffer  the offer as the export lists it
     * @param  array{action: string, tour_id: int|null, archive: bool, payload_sha256: string}  $plan  from LegacyCatalogPlanner
     * @return array{tour_id: int, notes: array<int, string>}
     */
    public function import(LegacyCatalogOffer $offer, array $rawOffer, array $plan, LegacyImportRun $run): array
    {
        $notes = $offer->notes;
        $taxonomy = $this->taxonomy->resolve($offer->taxonomy);
        $legacyBaseUrl = (string) config('services.legacy_adria.base_url');
        $localUrl = fn (string $url): ?string => $this->media->localUrl($url);
        $html = collect($offer->html)->map(fn (?string $value): ?string => LegacyHtmlContent::prepare($value, $legacyBaseUrl, $localUrl))->all();
        $galleries = [];

        foreach ($offer->galleries as $collection => $images) {
            $galleries[$collection] = $this->galleryItems($images, $offer->name, $notes);
        }

        $sliderImage = $this->localFile($offer->sliderImageUrl, 'slider image', $notes);
        $programPdf = $this->localFile($offer->programPdfUrl, 'program PDF', $notes);

        foreach (array_filter($offer->html) as $value) {
            foreach (LegacyHtmlContent::imageUrls($value, $legacyBaseUrl) as $url) {
                if ($localUrl($url) === null) {
                    $notes[] = "Image in a text not mirrored: {$url}";
                }
            }
        }

        $tourId = DB::transaction(function () use ($offer, $rawOffer, $plan, $run, $taxonomy, $html, $galleries, $sliderImage, $programPdf, &$notes): int {
            $existing = $plan['tour_id'] !== null ? Tour::withTrashed()->findOrFail($plan['tour_id']) : null;
            $tour = $existing ?? new Tour;

            if ($existing?->trashed()) {
                $existing->restore();
            }

            $countryCodes = $this->countryCodes($taxonomy['countries']);
            $regionId = $this->regionId($taxonomy['countries']);
            $categoryIds = $this->categoryIds($taxonomy['categories']);

            $tour->fill([
                ...$offer->attributes,
                ...$html,
                'travel_mode_id' => $offer->travelMode !== null ? $this->references->travelMode($offer->travelMode) : null,
                'slider_image' => $sliderImage,
                'program_pdf_path' => $programPdf,
                // Countries and categories found on the site stay unless the
                // legacy offer names its own; categories the office added
                // (e.g. "Repülős körutazások") are kept as well.
                'country_ids' => $countryCodes !== [] ? $countryCodes : ($existing?->country_ids ?? []),
                'region_id' => $regionId ?? $existing?->region_id,
                'category_ids' => array_values(array_unique([...($existing?->category_ids ?? []), ...$categoryIds])),
            ]);
            $tour->forceFill([
                'legacy_id' => $offer->legacyId,
                'legacy_attributes' => [...$offer->legacyAttributes, 'unmapped' => $taxonomy['unmapped']],
            ]);

            // Switched off in the legacy admin, not for having departed: the
            // expiry sync must not switch it back on with a new date.
            if (! $offer->active) {
                $tour->expired_at = null;
            }

            // Keywords the office edited are never overwritten.
            if (($tour->search_keywords ?? []) === []) {
                $tour->search_keywords = TourSearchIndex::suggestKeywords($tour);
            }

            $tour->save();

            $placeIds = $this->departurePlaceIds($offer);
            $singleRoomChoices = $this->references->singleRoomChoices();

            $this->tourContentSync->syncDates(
                $tour,
                array_map(fn (array $date): array => $this->date($date, $placeIds, $singleRoomChoices), $offer->dates),
                keepBooked: true,
            );
            $this->tourContentSync->syncDeparturePlaces(
                $tour,
                array_values(array_unique($placeIds)),
                collect($offer->departurePlaces)->mapWithKeys(fn (array $place): array => [$placeIds[$place['legacy_id']] => $place['fee']])->all(),
            );
            $this->tourContentSync->syncProgramDays($tour, []);
            $this->tourContentSync->syncPriceItems($tour, []);
            $this->tourContentSync->syncPartnerBonuses($tour, $offer->partnerBonuses);

            foreach ([TourGalleryItem::MAIN, TourGalleryItem::PROGRAM, TourGalleryItem::INTRO] as $collection) {
                $this->tourContentSync->syncGalleryItems($tour, $galleries[$collection] ?? [], $collection);
            }

            if ($plan['archive']) {
                $tour->forceFill(['active' => false])->save();
                $tour->delete();
                $notes[] = 'Archived (inactive) as configured in legacy_catalog.archived_legacy_ids.';
            }

            LegacyImportRecord::query()->updateOrCreate(
                ['entity' => LegacyImportRecord::OFFER, 'legacy_id' => $offer->legacyId],
                [
                    'local_type' => Tour::class,
                    'local_id' => $tour->id,
                    'legacy_import_run_id' => $run->id,
                    'payload_sha256' => $plan['payload_sha256'],
                    'raw_payload' => LegacyCatalogPlanner::payloadJson($rawOffer),
                    'status' => LegacyImportRecord::IMPORTED,
                    'messages' => array_values(array_unique($notes)),
                ],
            );

            return $tour->id;
        });

        return ['tour_id' => $tourId, 'notes' => array_values(array_unique($notes))];
    }

    /**
     * @param  CatalogDate  $date
     * @param  array<int, int>  $placeIds  place id keyed by legacy boarding point id
     * @param  array<int, string>  $singleRoomChoices
     * @return array<string, mixed>
     */
    private function date(array $date, array $placeIds, array $singleRoomChoices): array
    {
        $datePlaceIds = collect($date['departure_places'])->map(fn (array $place): int => $placeIds[$place['legacy_id']])->unique()->values()->all();

        return [
            ...collect($date)->except(['departure_places', 'extras'])->all(),
            // Null: every departure place of the tour.
            'departure_place_ids' => $datePlaceIds === [] || count($datePlaceIds) === count(array_unique($placeIds)) ? null : $datePlaceIds,
            'extras' => array_map(fn (array $extra): array => [
                ...$extra,
                'choices' => $extra['charge_rule'] === TourExtraChargeRule::SOLO_TRAVELLER ? $singleRoomChoices : [],
            ], $date['extras']),
        ];
    }

    /**
     * @return array<int, int> place id keyed by legacy boarding point id
     */
    private function departurePlaceIds(LegacyCatalogOffer $offer): array
    {
        return collect($offer->departurePlaces)
            ->mapWithKeys(fn (array $place): array => [$place['legacy_id'] => $this->references->legacyDeparturePlaceId($place['legacy_id'], $place['name'])])
            ->all();
    }

    /**
     * @param  array<int, CatalogImage>  $images
     * @param  array<int, string>  $notes
     * @return array<int, array<string, mixed>>
     */
    private function galleryItems(array $images, string $alt, array &$notes): array
    {
        $items = [];

        foreach ($images as $image) {
            $media = $this->media->media($image['url']);

            if ($media === null) {
                $notes[] = "Gallery image not mirrored: {$image['url']}";

                continue;
            }

            $items[] = [
                'media_id' => $media->id,
                'legacy_image_id' => $image['legacy_image_id'],
                'title' => $image['title'],
                'alt' => $alt,
                'sort_order' => $image['sort_order'],
            ];
        }

        return $items;
    }

    /**
     * @param  array<int, string>  $notes
     */
    private function localFile(?string $url, string $label, array &$notes): ?string
    {
        if ($url === null) {
            return null;
        }

        $local = $this->media->localUrl($url);

        if ($local === null) {
            $notes[] = "The {$label} is not mirrored: {$url}";
        }

        return $local;
    }

    /**
     * @param  array<int, array{code: string, name: string, region_slug: ?string}>  $countries
     * @return array<int, string>
     */
    private function countryCodes(array $countries): array
    {
        foreach ($countries as $country) {
            TourReferenceOption::query()->firstOrCreate(
                ['type' => 'country', 'code' => $country['code']],
                ['name' => $country['name'], 'active' => true, 'sort_order' => 0],
            );
        }

        return array_column($countries, 'code');
    }

    /**
     * @param  array<int, array{code: string, name: string, region_slug: ?string}>  $countries
     */
    private function regionId(array $countries): ?int
    {
        $slugs = array_values(array_filter(array_column($countries, 'region_slug')));

        if ($slugs === []) {
            return null;
        }

        return Region::query()->whereIn('slug', $slugs)->get(['id', 'slug'])
            ->sortBy(fn (Region $region): int|false => array_search($region->slug, $slugs, true))
            ->first()?->id;
    }

    /**
     * @param  array<int, string>  $names
     * @return array<int, string>
     */
    private function categoryIds(array $names): array
    {
        return array_values(array_unique(array_map(fn (string $name): string => (string) BlogCategory::firstOrCreateForName($name)->id, $names)));
    }
}
