<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * The company's age, counted from its founding day: editable texts write it
 * as the "{evek}" placeholder ("{evek}+ év tapasztalat") and every page and
 * email shows the number of full years in its place.
 */
final class CompanyYears
{
    public const FOUNDED_ON = '2003-08-27';

    public const PLACEHOLDER = '{evek}';

    /**
     * Full years since the founding day (22 until 2026-08-26, 23 from 2026-08-27).
     */
    public static function count(?CarbonInterface $today = null): int
    {
        return (int) CarbonImmutable::parse(self::FOUNDED_ON)->diffInYears(($today ?? now())->startOfDay());
    }

    /**
     * A text with the placeholder filled in.
     */
    public static function fill(?string $text, ?CarbonInterface $today = null): ?string
    {
        return $text === null ? null : str_replace(self::PLACEHOLDER, (string) self::count($today), $text);
    }
}
