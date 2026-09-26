<?php

namespace App\Support\Tour;

/**
 * How a tour date extra's price is charged: once per passenger, or once
 * for the whole booking.
 */
final class TourExtraPriceUnit
{
    public const PER_PERSON = 'per_person';

    public const PER_BOOKING = 'per_booking';

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [self::PER_PERSON, self::PER_BOOKING];
    }
}
