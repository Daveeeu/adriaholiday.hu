<?php

namespace App\Support;

use App\Models\Tour;
use Illuminate\Support\Str;

/**
 * Display attributes of a tour (transport, accommodation, meals, duration,
 * country...). The structured columns are the source of truth; early seeded
 * tours kept some of them as a JSON blob inside the `notes` column instead,
 * which stays the fallback. This is the single place that resolves them,
 * shared by every resource and document that shows them.
 */
class TourMeta
{
    /**
     * Shown instead of a departure date or price the tour does not have yet.
     */
    public const INQUIRE_LABEL = 'Érdeklődj nálunk';

    /**
     * @return array<string, mixed>
     */
    public static function extract(Tour $tour): array
    {
        $notes = trim((string) $tour->notes);

        if ($notes === '') {
            return [];
        }

        $decoded = json_decode($notes, true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Travel mode code: "bus", "plane" or "train".
     */
    public static function transport(Tour $tour): ?string
    {
        return self::filled($tour->travel_mode_id) ?? self::filled(self::extract($tour)['transport'] ?? null);
    }

    public static function transportLabel(Tour $tour): ?string
    {
        return match (self::transport($tour)) {
            'plane' => 'Repülős',
            'bus' => 'Buszos',
            'train' => 'Vonatos',
            default => null,
        };
    }

    public static function accommodation(Tour $tour): ?string
    {
        return self::filled($tour->accommodation) ?? self::filled(self::extract($tour)['accommodation'] ?? null);
    }

    public static function meals(Tour $tour): ?string
    {
        $meals = self::filled($tour->catering) ?? self::filled(self::extract($tour)['meals'] ?? null);

        return $meals !== null ? Str::ucfirst($meals) : null;
    }

    /**
     * "8 nap / 7 éj", counted from the tour's earliest date.
     */
    public static function duration(Tour $tour): ?string
    {
        $firstDate = $tour->dates->sortBy('start_date')->first();

        if ($firstDate?->start_date === null || $firstDate->end_date === null) {
            return self::filled(self::extract($tour)['duration'] ?? null);
        }

        $days = max(1, (int) $firstDate->start_date->diffInDays($firstDate->end_date) + 1);
        $nights = $days - 1;

        return "{$days} nap / {$nights} éj";
    }

    /**
     * "2026.07.12. - 19.", from the tour's earliest date unless the legacy meta names it.
     */
    public static function departureLabel(Tour $tour): string
    {
        $legacyLabel = self::filled(self::extract($tour)['departureDateLabel'] ?? null);

        if ($legacyLabel !== null) {
            return $legacyLabel;
        }

        $firstDate = $tour->dates->sortBy('start_date')->first();

        return $firstDate?->start_date && $firstDate->end_date
            ? $firstDate->start_date->format('Y.m.d.').' - '.$firstDate->end_date->format('d.')
            : self::INQUIRE_LABEL;
    }

    /**
     * The tour's countries, e.g. "Spanyolország, Marokkó", else its region.
     */
    public static function country(Tour $tour): ?string
    {
        $countries = collect(TourLabelResolver::referenceOptionItems('country', $tour->country_ids ?? []))
            ->pluck('label')
            ->implode(', ');

        return self::filled(self::extract($tour)['country'] ?? null) ?? self::filled($countries) ?? $tour->region?->name;
    }

    private static function filled(mixed $value): ?string
    {
        $trimmed = trim((string) $value);

        return $trimmed !== '' ? $trimmed : null;
    }
}
