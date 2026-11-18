<?php

namespace App\Support\Tour;

/**
 * The most passengers a departure takes unless the office sets otherwise: a
 * full coach on round trips, a plane's group allotment on flying ones. The
 * admin's date editor mirrors these (tour-date-capacity.ts).
 */
final class TourDateCapacity
{
    public const COACH = 45;

    public const PLANE = 22;

    public static function defaultFor(?string $travelMode): int
    {
        return $travelMode === 'plane' ? self::PLANE : self::COACH;
    }
}
