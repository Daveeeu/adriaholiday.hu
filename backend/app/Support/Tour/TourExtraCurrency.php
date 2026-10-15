<?php

namespace App\Support\Tour;

/**
 * The currency of a tour date extra. Forint extras are part of the booking
 * total; an extra in any other currency (e.g. a city tax in euros) is paid
 * on site and never added to it.
 */
final class TourExtraCurrency
{
    public const HUF = 'HUF';

    public const EUR = 'EUR';

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [self::HUF, self::EUR];
    }

    public static function paidOnSite(string $currency): bool
    {
        return $currency !== self::HUF;
    }
}
