<?php

namespace App\Support;

/**
 * The site's one forint price format: "68.900 Ft" (dot thousands separator,
 * no decimals).
 */
final class HufPrice
{
    public static function format(float|int $amount): string
    {
        return self::amount($amount).' Ft';
    }

    /** The amount alone, e.g. "68.900", for labels that add their own currency. */
    public static function amount(float|int $amount): string
    {
        return number_format(round($amount), 0, ',', '.');
    }
}
