<?php

namespace App\Support\Booking;

use App\Models\Tour;
use App\Models\TourDate;
use App\Support\DiscountBadge;

/**
 * A small discount off the base price that nudges the visitor to book a date
 * whose seats are running low (the trip page's "Fogynak a helyek!" notice).
 * It never stacks with another discount: a date already on offer (a price
 * box discount badge) gets none, and the booking price drops it when a
 * coupon code is used.
 */
final class LastSeatsDiscount
{
    public const PERCENT = 5.0;

    public const LABEL = 'Utolsó helyek kedvezmény';

    /** The percentage the date gives off now, or null when it gives none. */
    public static function percentFor(Tour $tour, TourDate $tourDate): ?float
    {
        $onOffer = DiscountBadge::percent(DiscountBadge::of($tour, $tourDate)) !== null;

        return $tourDate->seatsRunningLow() && ! $onOffer ? self::PERCENT : null;
    }
}
