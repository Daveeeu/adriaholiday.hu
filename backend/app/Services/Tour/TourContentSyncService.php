<?php

namespace App\Services\Tour;

use App\Models\Tour;
use App\Models\TourProgramDay;
use App\Support\RichTextSanitizer;

/**
 * Persists the "child" records of a Tour (dates, partner bonuses, program days,
 * gallery items, price items) using a consistent replace-and-recreate strategy.
 *
 * Shared by the admin TourController (manual editing) and the legacy content
 * importer, so both paths write identical, validated shapes to the database.
 */
class TourContentSyncService
{
    public function syncDates(Tour $tour, array $dates): void
    {
        $tour->dates()->withTrashed()->get()->each->forceDelete();

        foreach ($dates as $date) {
            $tour->dates()->create([
                'start_date' => $date['start_date'] ?? null,
                'end_date' => $date['end_date'] ?? null,
                'price' => $date['price_box_price'] ?? $date['price'] ?? null,
                'price_box_price' => $date['price_box_price'] ?? $date['price'] ?? null,
                'price_box_displayed_price' => $date['price_box_displayed_price'] ?? null,
                'price_box_discount_badge' => $date['price_box_discount_badge'] ?? null,
                'price_box_min_participants' => $date['price_box_min_participants'] ?? null,
                'price_box_max_participants' => $date['price_box_max_participants'] ?? null,
                'price_box_available_seats' => $date['price_box_available_seats'] ?? null,
                'price_box_capacity' => $date['price_box_capacity'] ?? null,
                'status' => $date['status'] ?? 'planned',
            ]);
        }
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
