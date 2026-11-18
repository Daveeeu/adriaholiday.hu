<?php

namespace App\Support;

use App\Models\Tour;
use App\Models\TourDate;

/**
 * Reads the percentage out of a price box discount badge such as "-15%" or
 * "Last Minute -10 %". The public price box shows the price reduced by this
 * percentage, so bookings must charge the same reduced price.
 */
final class DiscountBadge
{
    /** The badge the public price box shows for a date: the date's own overrides the tour's. */
    public static function of(Tour $tour, ?TourDate $tourDate): ?string
    {
        return filled($tourDate?->price_box_discount_badge) ? $tourDate->price_box_discount_badge : $tour->price_box_discount_badge;
    }

    public static function percent(?string $badge): ?float
    {
        if ($badge === null || ! preg_match('/(-?\d+(?:[.,]\d+)?)\s*%/u', $badge, $match)) {
            return null;
        }

        $percent = abs((float) str_replace(',', '.', $match[1]));

        return $percent > 0 && $percent < 100 ? $percent : null;
    }
}
