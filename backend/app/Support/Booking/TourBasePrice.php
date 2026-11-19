<?php

namespace App\Support\Booking;

use App\Models\Tour;
use App\Models\TourDate;

/**
 * The per-person price a tour booking starts from, with the same precedence
 * as the public price box: the date's price, else the tour's.
 */
final class TourBasePrice
{
    public static function of(Tour $tour, ?TourDate $tourDate): ?float
    {
        $price = $tourDate?->price_box_price ?? $tourDate?->price ?? $tour->price_box_price ?? $tour->price;

        return $price !== null ? (float) $price : null;
    }
}
