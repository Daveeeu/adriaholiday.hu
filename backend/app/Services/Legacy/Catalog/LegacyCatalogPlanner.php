<?php

namespace App\Services\Legacy\Catalog;

use App\Models\Booking;
use App\Models\LegacyImportRecord;
use App\Models\Tour;
use Illuminate\Support\Collection;

/**
 * Decides, without writing anything, what the catalog import does with each
 * legacy offer and with the tours already on the site:
 *  - a tour already linked to the offer's legacy id is updated (or left
 *    alone when its legacy data has not changed since it was imported);
 *  - a tour with the offer's slug and no legacy id is adopted: it keeps its
 *    id, so its bookings, statistics and URL stay as they are;
 *  - any other offer becomes a new tour;
 *  - a tour no offer adopts is an orphan: archived when nothing was booked
 *    on it, else only switched off.
 */
final class LegacyCatalogPlanner
{
    public const CREATE = 'create';

    public const ADOPT = 'adopt';

    public const UPDATE = 'update';

    public const UNCHANGED = 'unchanged';

    public const CONFLICT = 'conflict';

    /**
     * @param  array<int, array<string, mixed>>  $offers  valid offers keyed by legacy id
     * @return array<int, array{legacy_id: int, slug: string, action: string, tour_id: int|null, tour_trashed: bool, archive: bool, bookings: int, payload_sha256: string, reason: string|null}>
     */
    public function plan(array $offers): array
    {
        $legacyIds = array_keys($offers);
        $linked = Tour::withTrashed()->whereIn('legacy_id', $legacyIds)->get()->keyBy('legacy_id');
        $bySlug = Tour::withTrashed()->whereIn('seo_name', collect($offers)->pluck('slug')->map(fn (mixed $slug): string => trim((string) $slug)))->get()->keyBy('seo_name');
        $records = LegacyImportRecord::query()->where('entity', LegacyImportRecord::OFFER)->whereIn('legacy_id', $legacyIds)->get()->keyBy('legacy_id');
        $bookings = $this->bookingCounts($linked->pluck('id')->merge($bySlug->pluck('id')));
        $archived = array_map('intval', (array) config('legacy_catalog.archived_legacy_ids', []));

        return collect($offers)->map(function (array $offer, int $legacyId) use ($linked, $bySlug, $records, $bookings, $archived): array {
            $slug = trim((string) $offer['slug']);
            $hash = self::payloadHash($offer);
            $tour = $linked->get($legacyId);
            $sameSlug = $bySlug->get($slug);
            [$action, $reason] = match (true) {
                $tour !== null && $records->get($legacyId)?->status === LegacyImportRecord::IMPORTED && $records->get($legacyId)?->payload_sha256 === $hash => [self::UNCHANGED, null],
                $tour !== null && $tour->seo_name !== $slug && $sameSlug !== null && $sameSlug->id !== $tour->id => [self::CONFLICT, "Another tour (#{$sameSlug->id}) already has the slug \"{$slug}\"."],
                $tour !== null => [self::UPDATE, null],
                $sameSlug !== null && $sameSlug->legacy_id !== null => [self::CONFLICT, "Tour #{$sameSlug->id} with the slug \"{$slug}\" belongs to legacy offer {$sameSlug->legacy_id}."],
                $sameSlug !== null => [self::ADOPT, null],
                default => [self::CREATE, null],
            };
            $target = $action === self::ADOPT || $action === self::CONFLICT ? ($tour ?? $sameSlug) : $tour;

            return [
                'legacy_id' => $legacyId,
                'slug' => $slug,
                'action' => $action,
                'tour_id' => $target?->id,
                'tour_trashed' => (bool) $target?->trashed(),
                'archive' => in_array($legacyId, $archived, true),
                'bookings' => $target !== null ? (int) ($bookings[$target->id] ?? 0) : 0,
                'payload_sha256' => $hash,
                'reason' => $reason,
            ];
        })->all();
    }

    /**
     * Tours on the site no legacy offer of the catalog adopts or updates.
     *
     * @param  array<int, array{tour_id: int|null}>  $plan
     * @return array<int, array{tour_id: int, seo_name: string|null, name: string, active: bool, bookings: int}>
     */
    public function orphans(array $plan): array
    {
        $covered = collect($plan)->pluck('tour_id')->filter()->all();
        $tours = Tour::query()->whereNotIn('id', $covered)->get(['id', 'seo_name', 'name', 'active']);
        $bookings = $this->bookingCounts($tours->pluck('id'));

        return $tours->map(fn (Tour $tour): array => [
            'tour_id' => $tour->id,
            'seo_name' => $tour->seo_name,
            'name' => $tour->name,
            'active' => $tour->active,
            'bookings' => (int) ($bookings[$tour->id] ?? 0),
        ])->values()->all();
    }

    /**
     * The hash of an offer's legacy data, which tells whether it changed since its import.
     *
     * @param  array<string, mixed>  $offer
     */
    public static function payloadHash(array $offer): string
    {
        return hash('sha256', self::payloadJson($offer));
    }

    /**
     * @param  array<string, mixed>  $offer
     */
    public static function payloadJson(array $offer): string
    {
        return json_encode($offer, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    /**
     * @param  Collection<int, int>  $tourIds
     * @return array<int, int> number of bookings keyed by tour id
     */
    private function bookingCounts(Collection $tourIds): array
    {
        return Booking::query()
            ->whereIn('tour_id', $tourIds->unique()->values())
            ->selectRaw('tour_id, count(*) as aggregate')
            ->groupBy('tour_id')
            ->pluck('aggregate', 'tour_id')
            ->map(fn (mixed $count): int => (int) $count)
            ->all();
    }
}
