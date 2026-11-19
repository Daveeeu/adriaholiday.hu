<?php

namespace App\Support\Booking;

use App\Models\Tour;
use App\Models\TourDate;
use App\Support\DiscountBadge;

/**
 * A small discount that nudges a visitor reading about a date whose seats are
 * running low to book it: the trip page offers it as a one-day coupon (see
 * LastSeatsCouponIssuer), the price itself stays full.
 *
 * It is for the trips Adria Holiday runs itself, the tours of this site:
 * apartment stays are booked apart and take no coupon, and partner offers
 * booked elsewhere (e.g. Cesys) never see one. Of those trips only a date
 * sold at full price, in forints, from MIN_BASE_PRICE a person gets one: one
 * on offer (a price box discount badge or a struck pre-promotion price) gets
 * none, as discounts never stack.
 */
final class LastSeatsDiscount
{
    public const PERCENT = 5.0;

    public const LABEL = 'Utolsó helyek kupon';

    public const VALID_HOURS = 24;

    /** The lowest per-person base price (in forints) a date offering the coupon may have. */
    public const MIN_BASE_PRICE = 60000.0;

    /** The percentage the date's coupon gives off now, or null when it offers none. */
    public static function percentFor(Tour $tour, TourDate $tourDate): ?float
    {
        $onOffer = DiscountBadge::percent(DiscountBadge::of($tour, $tourDate)) !== null || $tourDate->hasStruckPrice();
        $basePrice = TourBasePrice::of($tour, $tourDate);
        $pricedHighEnough = ($tour->price_box_currency ?: 'HUF') === 'HUF'
            && $basePrice !== null
            && $basePrice >= self::MIN_BASE_PRICE;

        return $tourDate->seatsRunningLow() && ! $onOffer && $pricedHighEnough ? self::PERCENT : null;
    }
}
