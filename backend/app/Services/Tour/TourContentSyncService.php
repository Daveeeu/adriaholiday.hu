<?php

namespace App\Services\Tour;

use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourProgramDay;
use App\Support\RichTextSanitizer;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Support\Collection;

/**
 * Persists the "child" records of a Tour (dates with their extras, partner bonuses, program days,
 * gallery items, price items). Dates are updated in place because bookings
 * reference them; the other records use a replace-and-recreate strategy.
 *
 * Shared by the admin TourController (manual editing) and the legacy content
 * importer, so both paths write identical, validated shapes to the database.
 */
class TourContentSyncService
{
    private const DATE_FIELDS = [
        'start_date',
        'end_date',
        'price_box_displayed_price',
        'price_box_discount_badge',
        'price_box_min_participants',
        'price_box_max_participants',
        'price_box_available_seats',
        'price_box_capacity',
        'status',
    ];

    /**
     * Updates each requested date in place when it matches a stored one (by
     * id, else by its start and end date), so bookings keep pointing at their
     * date; stored dates nobody asked for are removed and the rest created.
     * Fields a requested date leaves out keep their stored value.
     *
     * @param  array<int, array<string, mixed>>  $dates
     */
    public function syncDates(Tour $tour, array $dates): void
    {
        $unmatched = $tour->dates()->get()->keyBy('id');

        foreach ($dates as $date) {
            $tourDate = $this->matchingDate($unmatched, $date) ?? new TourDate(['status' => 'planned']);
            $unmatched->forget($tourDate->id);

            $tourDate->fill(array_intersect_key($date, array_flip(self::DATE_FIELDS)));

            if (array_key_exists('price', $date) || array_key_exists('price_box_price', $date)) {
                $tourDate->price = $tourDate->price_box_price = $date['price_box_price'] ?? $date['price'] ?? null;
            }

            $tourDate->status ??= 'planned';
            $tour->dates()->save($tourDate);

            if (array_key_exists('extras', $date)) {
                $extras = $this->keepStoredExtraOrder($tourDate, $date['extras'] ?? []);
                $tourDate->extras()->delete();
                $this->createDateExtras($tourDate, $extras);
            }
        }

        $unmatched->each->delete();
    }

    /**
     * Extras sent without a sort order (the legacy import) keep the position
     * an admin gave the extra of the same name, so a re-import does not undo
     * a reordering; new ones go after them. The admin form always sends one.
     *
     * @param  array<int, array<string, mixed>>  $extras
     * @return array<int, array<string, mixed>>
     */
    private function keepStoredExtraOrder(TourDate $tourDate, array $extras): array
    {
        if (! $tourDate->exists || collect($extras)->every(fn (array $extra): bool => isset($extra['sort_order']))) {
            return $extras;
        }

        $storedOrder = $tourDate->extras()->pluck('sort_order', 'name');
        $nextOrder = (int) $storedOrder->max();

        return collect($extras)
            ->values()
            ->map(fn (array $extra): array => [
                ...$extra,
                'sort_order' => $extra['sort_order'] ?? $storedOrder->get(trim((string) ($extra['name'] ?? ''))) ?? ++$nextOrder,
            ])
            ->sortBy('sort_order')
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, TourDate>  $candidates
     * @param  array<string, mixed>  $date
     */
    private function matchingDate(Collection $candidates, array $date): ?TourDate
    {
        $id = $date['id'] ?? null;

        if (is_numeric($id) && $candidates->has((int) $id)) {
            return $candidates->get((int) $id);
        }

        return $candidates->first(fn (TourDate $candidate): bool => $candidate->start_date?->toDateString() === ($date['start_date'] ?? null)
            && $candidate->end_date?->toDateString() === ($date['end_date'] ?? null));
    }

    /**
     * @param  array<int, array{name?: string, price?: float|int|string|null, price_unit?: string|null, charge_rule?: string|null, choices?: array<int, string>|null, sort_order?: int|null}>  $extras
     */
    private function createDateExtras(TourDate $tourDate, array $extras): void
    {
        foreach (array_values($extras) as $index => $extra) {
            $name = trim(strip_tags((string) ($extra['name'] ?? '')));

            if ($name === '' || ! is_numeric($extra['price'] ?? null)) {
                continue;
            }

            $tourDate->extras()->create([
                'name' => $name,
                'price' => (float) $extra['price'],
                'price_unit' => in_array($extra['price_unit'] ?? null, TourExtraPriceUnit::all(), true)
                    ? $extra['price_unit']
                    : TourExtraPriceUnit::PER_PERSON,
                'charge_rule' => in_array($extra['charge_rule'] ?? null, TourExtraChargeRule::all(), true)
                    ? $extra['charge_rule']
                    : TourExtraChargeRule::OPTIONAL,
                'choices' => $this->normalizeChoices($extra['choices'] ?? []),
                'sort_order' => (int) ($extra['sort_order'] ?? ($index + 1)),
            ]);
        }
    }

    /**
     * @param  array<int, mixed>  $choices
     * @return array<int, string>|null
     */
    private function normalizeChoices(array $choices): ?array
    {
        $normalized = collect($choices)
            ->map(fn (mixed $choice): string => trim(strip_tags((string) $choice)))
            ->filter()
            ->unique()
            ->values()
            ->all();

        return $normalized !== [] ? $normalized : null;
    }

    /**
     * Attaches the tour's departure places with their optional per-tour fee,
     * which overrides the place's general fee on this tour only.
     *
     * @param  array<int, int|string>  $departurePlaceIds
     * @param  array<int|string, float|int|string|null>  $fees  keyed by departure place id
     */
    public function syncDeparturePlaces(Tour $tour, array $departurePlaceIds, array $fees = []): void
    {
        $tour->departurePlaces()->sync(collect($departurePlaceIds)
            ->mapWithKeys(fn (int|string $id): array => [
                (int) $id => ['fee' => is_numeric($fees[$id] ?? null) ? (float) $fees[$id] : null],
            ])
            ->all());
    }

    public function syncPartnerBonuses(Tour $tour, array $bonuses): void
    {
        $tour->partnerBonuses()->withTrashed()->get()->each->forceDelete();

        foreach ($bonuses as $bonus) {
            $tour->partnerBonuses()->create([
                'sort_order' => $bonus['sort_order'] ?? 0,
                'label' => $bonus['label'],
                'value' => $bonus['value'] ?? null,
            ]);
        }
    }

    public function syncProgramDays(Tour $tour, array $programDays): void
    {
        $existingDays = $tour->programDays()->get()->keyBy('id');
        $requestedExistingIds = collect($programDays)
            ->map(fn (array $day) => $day['id'] ?? null)
            ->filter(fn ($id): bool => is_numeric($id) && $existingDays->has((int) $id))
            ->map(fn ($id): int => (int) $id)
            ->values()
            ->all();

        if ($requestedExistingIds === []) {
            $tour->programDays()->delete();
        } else {
            $tour->programDays()->whereNotIn('id', $requestedExistingIds)->delete();
        }

        foreach (array_values($programDays) as $index => $day) {
            $title = trim((string) ($day['title'] ?? ''));

            if ($title === '') {
                continue;
            }

            $badges = collect($day['badges'] ?? [])
                ->map(function ($badge): string {
                    if (is_array($badge)) {
                        return trim((string) ($badge['text'] ?? $badge['value'] ?? ''));
                    }

                    return trim((string) $badge);
                })
                ->filter()
                ->values()
                ->all();

            $attributes = [
                'sort_order' => (int) ($day['sort_order'] ?? ($index + 1)),
                'day_number' => (int) ($day['day_number'] ?? ($index + 1)),
                'title' => $title,
                'description' => RichTextSanitizer::sanitize($day['description'] ?? null),
                'image' => isset($day['image']) ? trim((string) $day['image']) : null,
                'icon' => isset($day['icon']) ? trim((string) $day['icon']) : null,
                'experience_type' => isset($day['experience_type']) ? trim((string) $day['experience_type']) : null,
                'badges' => $badges,
                'active' => filter_var($day['active'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true,
            ];

            $existingDay = is_numeric($day['id'] ?? null)
                ? $existingDays->get((int) $day['id'])
                : null;

            if ($existingDay instanceof TourProgramDay) {
                $existingDay->update($attributes);

                continue;
            }

            $tour->programDays()->create($attributes);
        }
    }

    public function syncGalleryItems(Tour $tour, array $galleryItems): void
    {
        $tour->galleryItems()->delete();

        foreach (array_values($galleryItems) as $index => $item) {
            $mediaId = $item['media_id'] ?? null;

            if (! is_numeric($mediaId)) {
                continue;
            }

            $tour->galleryItems()->create([
                'media_id' => (int) $mediaId,
                'title' => isset($item['title']) ? trim((string) $item['title']) : null,
                'alt' => isset($item['alt']) ? trim((string) $item['alt']) : null,
                'caption' => isset($item['caption']) ? trim((string) $item['caption']) : null,
                'sort_order' => (int) ($item['sort_order'] ?? ($index + 1)),
                'active' => filter_var($item['active'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true,
            ]);
        }
    }

    public function syncPriceItems(Tour $tour, array $priceItems): void
    {
        $tour->priceItems()->delete();

        foreach (array_values($priceItems) as $index => $item) {
            $text = trim(strip_tags((string) ($item['text'] ?? '')));
            $type = in_array(($item['type'] ?? 'included'), ['included', 'excluded'], true)
                ? $item['type']
                : 'included';

            if ($text === '') {
                continue;
            }

            $tour->priceItems()->create([
                'type' => $type,
                'text' => $text,
                'sort_order' => (int) ($item['sort_order'] ?? ($index + 1)),
                'active' => filter_var($item['active'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true,
            ]);
        }
    }
}
