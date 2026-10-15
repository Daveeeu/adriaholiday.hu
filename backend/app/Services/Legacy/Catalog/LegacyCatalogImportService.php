<?php

namespace App\Services\Legacy\Catalog;

use App\Models\Booking;
use App\Models\LegacyImportRecord;
use App\Models\LegacyImportRun;
use App\Models\Tour;
use App\Services\Legacy\LegacyMediaMirror;
use App\Services\Legacy\LegacyReferenceResolver;
use App\Services\Tour\ExpiredTourService;
use App\Support\Legacy\Catalog\LegacyCatalog;
use App\Support\Legacy\Catalog\LegacyCatalogOffer;
use App\Support\PublicContentCache;
use App\Support\Tour\TourDateStatus;
use App\Support\Tour\TourExtraCurrency;
use Closure;
use Illuminate\Support\Str;
use Throwable;

/**
 * The legacy catalog import from start to end: validates and maps every
 * offer, plans what happens to it, then either reports the plan (dry run,
 * nothing written) or carries it out offer by offer, so a failed offer never
 * stops the others and a re-run picks up where the last one stopped.
 *
 * @phpstan-type OfferRow array<string, mixed>
 */
final class LegacyCatalogImportService
{
    public function __construct(
        private readonly LegacyCatalogValidator $validator,
        private readonly LegacyCatalogOfferMapper $mapper,
        private readonly LegacyCatalogPlanner $planner,
        private readonly LegacyCatalogImporter $importer,
        private readonly LegacyTaxonomyResolver $taxonomy,
        private readonly LegacyReferenceResolver $references,
        private readonly ExpiredTourService $expiredTours,
        private readonly LegacyMediaMirror $media,
    ) {}

    /**
     * Validation, mapping and plan of the selected offers (all by default).
     *
     * @param  array<int, int>  $only  legacy ids
     * @return array{catalog_errors: array<int, string>, offers: array<int, array{raw: mixed, offer: LegacyCatalogOffer|null, errors: array<int, string>, warnings: array<int, string>, plan: array<string, mixed>|null}>, orphans: array<int, array<string, mixed>>}
     */
    public function prepare(LegacyCatalog $catalog, array $only = []): array
    {
        $boardingPoints = $catalog->boardingPoints();
        $entries = [];

        foreach ($catalog->offers as $index => $raw) {
            $legacyId = is_array($raw) && is_int($raw['legacy_id'] ?? null) ? $raw['legacy_id'] : -($index + 1);

            if ($only !== [] && ! in_array($legacyId, $only, true)) {
                continue;
            }

            $issues = $this->validator->offerIssues($raw, $boardingPoints);
            $entries[$legacyId] = [
                'raw' => $raw,
                'offer' => $issues['errors'] === [] ? $this->mapper->map($raw, today()) : null,
                'errors' => $issues['errors'],
                'warnings' => $issues['warnings'],
                'plan' => null,
            ];
        }

        $valid = collect($entries)->filter(fn (array $entry): bool => $entry['offer'] !== null)->map(fn (array $entry): array => $entry['raw'])->all();

        foreach ($this->planner->plan($valid) as $legacyId => $plan) {
            $entries[$legacyId]['plan'] = $plan;
        }

        return [
            'catalog_errors' => $this->validator->catalogErrors($catalog),
            'offers' => $entries,
            'orphans' => $only === [] ? $this->planner->orphans(array_filter(array_column($entries, 'plan'))) : [],
        ];
    }

    /**
     * One report row per offer of a prepared catalog, without writing anything.
     *
     * @param  array{offers: array<int, array<string, mixed>>}  $prepared
     * @return array<int, OfferRow>
     */
    public function reportRows(array $prepared): array
    {
        $legacyBaseUrl = (string) config('services.legacy_adria.base_url');

        return collect($prepared['offers'])->map(function (array $entry, int $legacyId) use ($legacyBaseUrl): array {
            /** @var LegacyCatalogOffer|null $offer */
            $offer = $entry['offer'];
            $plan = $entry['plan'];
            $raw = is_array($entry['raw']) ? $entry['raw'] : [];

            if ($offer === null) {
                return [
                    'legacy_id' => $legacyId, 'slug' => $raw['slug'] ?? null, 'name' => $raw['name'] ?? null,
                    'action' => 'invalid', 'manual_review' => true, 'review_reasons' => $entry['errors'],
                    'errors' => $entry['errors'], 'warnings' => $entry['warnings'],
                ];
            }

            $taxonomy = $this->taxonomy->resolve($offer->taxonomy);
            $mediaUrls = $offer->mediaUrls($legacyBaseUrl);
            $mirrored = collect($mediaUrls)->filter(fn (string $url): bool => $this->media->media($url) !== null)->count();
            $places = collect($offer->departurePlaces);
            $newPlaces = $places->reject(fn (array $place): bool => $this->references->findLegacyDeparturePlace($place['legacy_id'], $place['name']) !== null);
            $extras = collect($offer->dates)->flatMap(fn (array $date): array => $date['extras']);
            $today = today()->toDateString();
            $reviewReasons = [
                ...($plan['action'] === LegacyCatalogPlanner::CONFLICT ? [$plan['reason']] : []),
                ...$entry['warnings'],
                ...$offer->notes,
            ];

            return [
                'legacy_id' => $legacyId,
                'slug' => $offer->slug,
                'name' => $offer->name,
                'legacy_active' => $offer->active,
                'action' => $plan['action'],
                'tour_id' => $plan['tour_id'],
                'tour_trashed' => $plan['tour_trashed'],
                'archive' => $plan['archive'],
                'bookings_on_tour' => $plan['bookings'],
                'manual_review' => $reviewReasons !== [],
                'review_reasons' => $reviewReasons,
                'dates' => count($offer->dates),
                'upcoming_dates' => collect($offer->dates)->filter(fn (array $date): bool => $date['start_date'] >= $today)->count(),
                'bookable_upcoming_dates' => collect($offer->dates)->filter(fn (array $date): bool => $date['start_date'] >= $today && $date['status'] === TourDateStatus::AVAILABLE)->count(),
                'dates_with_own_stay' => collect($offer->dates)->filter(fn (array $date): bool => ($date['accommodation'] ?? $date['catering'] ?? $date['accommodation_info'] ?? $date['catering_info']) !== null)->count(),
                'extras' => $extras->count(),
                'extras_paid_on_site' => $extras->filter(fn (array $extra): bool => TourExtraCurrency::paidOnSite($extra['currency']))->count(),
                'departure_places' => $places->count(),
                'new_departure_places' => $newPlaces->pluck('name')->values()->all(),
                'gallery_images' => collect($offer->galleries)->map(fn (array $images): int => count($images))->all(),
                'media_files' => count($mediaUrls),
                'media_mirrored' => $mirrored,
                'partner_bonuses' => count($offer->partnerBonuses),
                'html_fields' => array_keys(array_filter($offer->html)),
                'categories' => $taxonomy['categories'],
                'countries' => array_column($taxonomy['countries'], 'name'),
                'unmapped' => $taxonomy['unmapped'],
                'warnings' => $entry['warnings'],
                'notes' => $offer->notes,
            ];
        })->values()->all();
    }

    /**
     * Imports the prepared offers. Offers unchanged since their import are
     * skipped unless forced; orphan tours are handled only when the whole
     * catalog is imported.
     *
     * @param  array{offers: array<int, array<string, mixed>>, orphans: array<int, array<string, mixed>>}  $prepared
     * @param  Closure(int, string, string): void  $progress  legacy id, outcome, message
     */
    public function import(LegacyCatalog $catalog, array $prepared, bool $force, bool $wholeCatalog, Closure $progress): LegacyImportRun
    {
        $run = LegacyImportRun::query()->create([
            'source_file' => $catalog->path,
            'source_sha256' => $catalog->sha256,
            'dry_run' => false,
            'status' => LegacyImportRun::RUNNING,
            'started_at' => now(),
        ]);
        $bookingsBefore = $this->bookingLinks();
        $outcomes = [];

        foreach ($prepared['offers'] as $legacyId => $entry) {
            $plan = $entry['plan'];
            $action = $entry['offer'] === null ? 'invalid' : $plan['action'];

            if ($action === 'invalid' || $action === LegacyCatalogPlanner::CONFLICT || ($action === LegacyCatalogPlanner::UNCHANGED && ! $force)) {
                $outcomes[$action === LegacyCatalogPlanner::UNCHANGED ? 'skipped' : 'failed'][] = $legacyId;
                $progress($legacyId, $action === LegacyCatalogPlanner::UNCHANGED ? 'skipped' : 'failed', $action === 'invalid' ? implode(' ', $entry['errors']) : (string) ($plan['reason'] ?? 'unchanged'));

                if ($action !== LegacyCatalogPlanner::UNCHANGED) {
                    $this->recordFailure($legacyId, $entry, $run, $action === 'invalid' ? $entry['errors'] : [(string) $plan['reason']]);
                }

                continue;
            }

            try {
                $result = $this->importer->import($entry['offer'], $entry['raw'], $plan, $run);
                $outcome = $action === LegacyCatalogPlanner::UNCHANGED ? LegacyCatalogPlanner::UPDATE : $action;
                $outcomes[$outcome][] = $legacyId;
                $progress($legacyId, $outcome, "tour #{$result['tour_id']}".($result['notes'] !== [] ? ' — '.count($result['notes']).' note(s)' : ''));
            } catch (Throwable $exception) {
                report($exception);
                $outcomes['failed'][] = $legacyId;
                $this->recordFailure($legacyId, $entry, $run, [$exception->getMessage()]);
                $progress($legacyId, 'failed', $exception->getMessage());
            }
        }

        $orphans = $wholeCatalog ? $this->retireOrphans($prepared['orphans']) : ['archived' => [], 'switched_off' => []];
        $expired = $this->expiredTours->sync();
        $bookingsAfter = $this->bookingLinks();

        PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PORTFOLIO_FILTERS, PublicContentCache::PORTFOLIO_COUNTRIES, PublicContentCache::SITEMAP);

        $run->update([
            'status' => ($outcomes['failed'] ?? []) === [] ? LegacyImportRun::COMPLETED : LegacyImportRun::COMPLETED_WITH_ERRORS,
            'finished_at' => now(),
            'summary' => [
                'outcomes' => collect($outcomes)->map(fn (array $ids): int => count($ids))->all(),
                'failed_legacy_ids' => $outcomes['failed'] ?? [],
                'orphans' => $orphans,
                'switched_off_as_expired' => $expired['deactivated'],
                'switched_on_again' => $expired['reactivated'],
                'bookings_before' => $bookingsBefore,
                'bookings_after' => $bookingsAfter,
            ],
        ]);

        return $run;
    }

    /**
     * Tours no legacy offer adopted: archived when nothing was booked on
     * them, else only switched off, so their bookings keep their tour.
     *
     * @param  array<int, array{tour_id: int, bookings: int}>  $orphans
     * @return array{archived: array<int, int>, switched_off: array<int, int>}
     */
    private function retireOrphans(array $orphans): array
    {
        $result = ['archived' => [], 'switched_off' => []];

        foreach ($orphans as $orphan) {
            $tour = Tour::query()->find($orphan['tour_id']);

            if ($tour === null) {
                continue;
            }

            $tour->forceFill(['active' => false])->save();

            if ($orphan['bookings'] === 0 && ! $tour->dates()->whereHas('bookings')->exists()) {
                $tour->delete();
                $result['archived'][] = $tour->id;
            } else {
                $result['switched_off'][] = $tour->id;
            }
        }

        return $result;
    }

    /**
     * @param  array<string, mixed>  $entry
     * @param  array<int, string>  $messages
     */
    private function recordFailure(int $legacyId, array $entry, LegacyImportRun $run, array $messages): void
    {
        if ($legacyId < 1) {
            return;
        }

        $record = LegacyImportRecord::query()->firstOrNew(['entity' => LegacyImportRecord::OFFER, 'legacy_id' => $legacyId]);

        // A record imported before keeps its status: only this run failed.
        if ($record->exists && $record->status === LegacyImportRecord::IMPORTED) {
            $record->update(['messages' => [...($record->messages ?? []), ...array_map(fn (string $message): string => "Run {$run->id}: {$message}", $messages)]]);

            return;
        }

        $raw = is_array($entry['raw']) ? $entry['raw'] : [];
        $record->fill([
            'legacy_import_run_id' => $run->id,
            'payload_sha256' => LegacyCatalogPlanner::payloadHash($raw),
            'raw_payload' => LegacyCatalogPlanner::payloadJson($raw),
            'status' => LegacyImportRecord::FAILED,
            'messages' => array_map(fn (string $message): string => Str::limit($message, 1000), $messages),
        ])->save();
    }

    /**
     * How bookings point at tours and dates, compared before and after a run.
     *
     * @return array{with_tour: int, with_date: int, tour_missing: int, date_missing: int}
     */
    public function bookingLinks(): array
    {
        return [
            'with_tour' => Booking::query()->whereNotNull('tour_id')->count(),
            'with_date' => Booking::query()->whereNotNull('tour_date_id')->count(),
            'tour_missing' => Booking::query()->whereNotNull('tour_id')->whereDoesntHave('tour', fn ($query) => $query->withTrashed())->count(),
            'date_missing' => Booking::query()->whereNotNull('tour_date_id')->whereDoesntHave('tourDate')->count(),
        ];
    }
}
