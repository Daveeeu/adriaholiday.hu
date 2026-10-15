<?php

namespace App\Services\Legacy\Catalog;

use App\Models\LegacyImportRecord;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourGalleryItem;
use App\Services\Legacy\LegacyMediaMirror;
use App\Support\Legacy\Catalog\LegacyCatalog;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * Checks, after an import, that the site holds the legacy catalog: every
 * offer as a tour with its status, dates, prices, extras, departure places,
 * galleries and original JSON; bookings still pointing at their tour and
 * date; nothing shown from the legacy website. Run it right after the
 * import: later bookings change seats and admins change content.
 */
final class LegacyCatalogVerifier
{
    private const HTML_COLUMNS = ['program', 'program_footer', 'teaser', 'tickets', 'optional_programs', 'prices', 'list_description'];

    public function __construct(
        private readonly LegacyCatalogValidator $validator,
        private readonly LegacyCatalogOfferMapper $mapper,
        private readonly LegacyCatalogImportService $imports,
        private readonly LegacyMediaMirror $media,
    ) {}

    /**
     * @return array<int, array{check: string, ok: bool, details: array<int, string>}>
     */
    public function verify(LegacyCatalog $catalog): array
    {
        $boardingPoints = $catalog->boardingPoints();
        $offers = collect($catalog->offers)
            ->filter(fn (mixed $offer): bool => $this->validator->offerIssues($offer, $boardingPoints)['errors'] === [])
            ->map(fn (array $offer) => ['raw' => $offer, 'offer' => $this->mapper->map($offer, today())])
            ->keyBy(fn (array $entry): int => $entry['offer']->legacyId);
        $tours = Tour::withTrashed()->whereIn('legacy_id', $offers->keys())->with(['departurePlaces'])->get()->keyBy('legacy_id');
        $dates = TourDate::withTrashed()->whereNotNull('legacy_id')->withCount('extras')->get()->keyBy('legacy_id');
        $archived = array_map('intval', (array) config('legacy_catalog.archived_legacy_ids', []));

        return [
            $this->check('Every legacy offer is a tour', $offers->keys()->diff($tours->keys())->map(fn (int $id): string => "Legacy offer {$id} has no tour.")),
            $this->check('Status: active, inactive, archived', $offers->map(fn (array $entry, int $id): ?string => $this->statusProblem($tours->get($id), $entry['offer']->active, (bool) $entry['raw']['active'], in_array($id, $archived, true)))->filter()),
            $this->check('Names and URLs', $offers->map(fn (array $entry, int $id): ?string => ($tour = $tours->get($id)) !== null && ($tour->name !== $entry['offer']->name || $tour->seo_name !== $entry['offer']->slug) ? "Tour #{$tour->id} differs in name or URL from legacy offer {$id}." : null)->filter()),
            $this->check('Dates, prices, seats and extras', $offers->flatMap(fn (array $entry): array => $this->dateProblems($entry['offer']->dates, $tours->get($entry['offer']->legacyId), $dates))),
            $this->check('Departure places', $offers->map(fn (array $entry, int $id): ?string => ($tour = $tours->get($id)) !== null && $tour->departurePlaces->count() !== collect($entry['offer']->departurePlaces)->pluck('name')->unique()->count() ? "Tour #{$tour->id}: {$tour->departurePlaces->count()} departure places, legacy offer {$id} has ".collect($entry['offer']->departurePlaces)->pluck('name')->unique()->count().'.' : null)->filter()),
            $this->check('Galleries (mirrored images, in order, files on disk)', $offers->flatMap(fn (array $entry): array => $this->galleryProblems($entry['offer']->galleries, $tours->get($entry['offer']->legacyId)))),
            $this->check('Original legacy JSON kept', $offers->map(fn (array $entry, int $id): ?string => LegacyImportRecord::query()->where('entity', LegacyImportRecord::OFFER)->where('legacy_id', $id)->where('status', LegacyImportRecord::IMPORTED)->value('payload_sha256') === LegacyCatalogPlanner::payloadHash($entry['raw']) ? null : "Legacy offer {$id}: its imported JSON is missing or out of date.")->filter()),
            $this->check('Bookings keep their tour and date', $this->bookingProblems()),
            $this->check('Nothing is loaded from the legacy website', $tours->flatMap(fn (Tour $tour): array => $this->legacyReferences($tour))),
        ];
    }

    /**
     * @param  bool  $active  as imported (see LegacyCatalogOfferMapper)
     * @param  bool  $legacyActive  the legacy data's own flag, kept in legacy_attributes
     */
    private function statusProblem(?Tour $tour, bool $active, bool $legacyActive, bool $archived): ?string
    {
        if ($tour === null) {
            return null;
        }

        $expired = $active && ! $tour->active && $tour->expired_at !== null;

        return match (true) {
            $archived && (! $tour->trashed() || $tour->active) => "Tour #{$tour->id} should be archived and inactive.",
            ! $archived && $tour->trashed() => "Tour #{$tour->id} is archived.",
            ! $archived && $tour->active !== $active && ! $expired => "Tour #{$tour->id} is ".($tour->active ? 'active' : 'inactive').', the legacy offer is not.',
            ($tour->legacy_attributes['legacy_active'] ?? null) !== $legacyActive => "Tour #{$tour->id} lost the legacy offer's original status.",
            default => null,
        };
    }

    /**
     * @param  array<int, array<string, mixed>>  $legacyDates
     * @param  Collection<int, TourDate>  $dates  keyed by legacy id
     * @return array<int, string>
     */
    private function dateProblems(array $legacyDates, ?Tour $tour, Collection $dates): array
    {
        if ($tour === null) {
            return [];
        }

        $problems = [];

        foreach ($legacyDates as $legacy) {
            $date = $dates->get($legacy['legacy_id']);
            $label = "Tour #{$tour->id} date {$legacy['legacy_id']} ({$legacy['start_date']})";

            if ($date === null || $date->tour_id !== $tour->id || $date->trashed()) {
                $problems[] = "{$label} is missing.";

                continue;
            }

            $differs = array_filter([
                'days' => $date->start_date?->toDateString() !== $legacy['start_date'] || $date->end_date?->toDateString() !== $legacy['end_date'],
                'price' => (float) $date->price !== (float) $legacy['price'],
                'original price' => $date->price_box_original_price === null ? $legacy['price_box_original_price'] !== null : (float) $date->price_box_original_price !== (float) $legacy['price_box_original_price'],
                'status' => $date->status !== $legacy['status'],
                'seats' => $date->price_box_available_seats !== $legacy['price_box_available_seats'],
                'extras' => $date->extras_count !== count($legacy['extras']),
            ]);

            if ($differs !== []) {
                $problems[] = "{$label} differs: ".implode(', ', array_keys($differs)).'.';
            }
        }

        return $problems;
    }

    /**
     * @param  array<string, array<int, array{url: string}>>  $galleries
     * @return array<int, string>
     */
    private function galleryProblems(array $galleries, ?Tour $tour): array
    {
        if ($tour === null) {
            return [];
        }

        $problems = [];

        foreach ([TourGalleryItem::MAIN, TourGalleryItem::PROGRAM, TourGalleryItem::INTRO] as $collection) {
            $urls = array_column($galleries[$collection] ?? [], 'url');
            $mirrored = collect($urls)->filter(fn (string $url): bool => $this->media->media($url) !== null)->count();
            $items = $tour->galleryCollection($collection)->with('media')->get();

            if ($items->count() !== $mirrored) {
                $problems[] = "Tour #{$tour->id} {$collection} gallery: {$items->count()} images, {$mirrored} of ".count($urls).' legacy images mirrored.';
            }

            if ($items->pluck('sort_order')->all() !== $items->pluck('sort_order')->sort()->values()->all()) {
                $problems[] = "Tour #{$tour->id} {$collection} gallery is out of order.";
            }

            foreach ($items as $item) {
                if ($item->media === null || ! Storage::disk($item->media->disk)->exists($item->media->getPathRelativeToRoot())) {
                    $problems[] = "Tour #{$tour->id} {$collection} gallery: the file of media #{$item->media_id} is missing.";
                }
            }
        }

        return $problems;
    }

    /**
     * @return array<int, string>
     */
    private function bookingProblems(): array
    {
        $links = $this->imports->bookingLinks();

        return array_values(array_filter([
            $links['tour_missing'] > 0 ? "{$links['tour_missing']} booking(s) point to a tour that no longer exists." : null,
            $links['date_missing'] > 0 ? "{$links['date_missing']} booking(s) point to a date that no longer exists." : null,
        ]));
    }

    /**
     * @return array<int, string>
     */
    private function legacyReferences(Tour $tour): array
    {
        $host = (string) parse_url((string) config('services.legacy_adria.base_url'), PHP_URL_HOST);
        $problems = [];

        foreach (self::HTML_COLUMNS as $column) {
            $html = (string) $tour->getAttribute($column);

            if (preg_match_all('/<img\b[^>]*?\bsrc\s*=\s*["\']([^"\']+)["\']/i', $html, $matches) > 0) {
                foreach ($matches[1] as $source) {
                    if (! str_starts_with($source, '/') || str_starts_with($source, '//')) {
                        $problems[] = "Tour #{$tour->id} {$column}: image loaded from {$source}.";
                    }
                }
            }
        }

        foreach (['slider_image', 'program_pdf_path'] as $column) {
            $value = (string) $tour->getAttribute($column);

            if ($value !== '' && ($host !== '' && str_contains($value, $host) || preg_match('~^https?://~i', $value))) {
                $problems[] = "Tour #{$tour->id} {$column} points to {$value}.";
            }
        }

        return $problems;
    }

    /**
     * @param  Collection<int, string>|array<int, string>  $problems
     * @return array{check: string, ok: bool, details: array<int, string>}
     */
    private function check(string $name, Collection|array $problems): array
    {
        $details = collect($problems)->filter()->values()->all();

        return ['check' => $name, 'ok' => $details === [], 'details' => $details];
    }
}
