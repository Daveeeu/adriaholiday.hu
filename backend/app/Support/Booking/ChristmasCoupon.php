<?php

namespace App\Support\Booking;

use Carbon\CarbonImmutable;
use DateTimeInterface;

/**
 * The coupon the website's Christmas easter egg (the gift box in the footer)
 * gives a visitor: a small discount of their own on any trip that accepts
 * coupons, valid until the season ends. The season runs every year from
 * 15 November to Epiphany (6 January), in Hungarian time; the public site
 * shows the easter egg for the same days (src/app/christmas/christmas-season.ts).
 */
final class ChristmasCoupon
{
    public const PERCENT = 3.0;

    public const LABEL = 'Karácsonyi kupon';

    public const CODE_PREFIX = 'KAR';

    public const TIMEZONE = 'Europe/Budapest';

    private const STARTS_ON = ['month' => 11, 'day' => 15];

    private const ENDS_ON = ['month' => 1, 'day' => 6];

    /** The end of the season the moment falls in (the last second of 6 January), or null outside the season. */
    public static function seasonEndsAt(DateTimeInterface $moment): ?CarbonImmutable
    {
        $local = CarbonImmutable::instance($moment)->setTimezone(self::TIMEZONE);
        $endsThisYear = $local->setDate($local->year, self::ENDS_ON['month'], self::ENDS_ON['day'])->setTime(23, 59, 59);

        if ($local->lessThanOrEqualTo($endsThisYear)) {
            return $endsThisYear;
        }

        $startsThisYear = $local->setDate($local->year, self::STARTS_ON['month'], self::STARTS_ON['day'])->startOfDay();

        return $local->greaterThanOrEqualTo($startsThisYear) ? $endsThisYear->addYear() : null;
    }
}
