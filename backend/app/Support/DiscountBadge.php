<?php

namespace App\Support;

/**
 * Reads the percentage out of a price box discount badge such as "-15%" or
 * "Last Minute -10 %". The public price box shows the price reduced by this
 * percentage, so bookings must charge the same reduced price.
 */
final class DiscountBadge
{
    public static function percent(?string $badge): ?float
    {
        if ($badge === null || ! preg_match('/(-?\d+(?:[.,]\d+)?)\s*%/u', $badge, $match)) {
            return null;
        }

        $percent = abs((float) str_replace(',', '.', $match[1]));

        return $percent > 0 && $percent < 100 ? $percent : null;
    }
}
