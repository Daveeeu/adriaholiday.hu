<?php

namespace App\Support;

use App\Models\Tour;

/**
 * Tours store a handful of loosely-structured display attributes (badge,
 * transport, accommodation, meals, country, duration...) as a JSON blob
 * inside the `notes` column, a legacy-import artifact. This helper is the
 * single place that decodes it, shared by every resource that needs it.
 */
class TourMeta
{
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

    public static function transport(Tour $tour): ?string
    {
        return self::extract($tour)['transport'] ?? null;
    }

    public static function transportLabel(Tour $tour): ?string
    {
        return match (self::transport($tour)) {
            'plane' => 'Repülős',
            'bus' => 'Buszos',
            default => null,
        };
    }

    public static function country(Tour $tour): ?string
    {
        return self::extract($tour)['country'] ?? $tour->region?->name;
    }
}
