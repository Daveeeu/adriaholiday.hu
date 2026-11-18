<?php

namespace App\Support\Booking;

use App\Models\Tour;
use App\Models\TourDate;
use App\Support\DiscountBadge;

/**
 * A small discount that nudges a visitor reading about a date whose seats are
 * running low to book it: the trip page offers it as a one-day coupon (see
 * LastSeatsCouponIssuer), the price itself stays full. A date already on
 * offer (a price box discount badge) gets none, as discounts never stack.
 */
final class LastSeatsDiscount
{
    public const PERCENT = 5.0;

    public const LABEL = 'Utolsó helyek kupon';

    public const VALID_HOURS = 24;

    /** The percentage the date's coupon gives off now, or null when it offers none. */
    public static function percentFor(Tour $tour, TourDate $tourDate): ?float
    {
        $onOffer = DiscountBadge::percent(DiscountBadge::of($tour, $tourDate)) !== null;

        return $tourDate->seatsRunningLow() && ! $onOffer ? self::PERCENT : null;
    }
}
