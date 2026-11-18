<?php

namespace App\Support\Legacy;

use Carbon\CarbonInterface;

/**
 * The legacy admin reuses a tour's date rows year after year: once a run has
 * departed, the office moves the same row to the next run's date, and the
 * row's bookings move with it. A legacy booking therefore names the row's
 * latest date, not the run it was made for. The row only moves on after a
 * run departed, about a year before the next one, so a booking made more than
 * a year before the date it names was made for an earlier run.
 */
final class LegacyDateRun
{
    public static function isEarlierRun(CarbonInterface $bookedAt, CarbonInterface $departure): bool
    {
        return $bookedAt->lt($departure->copy()->startOfDay()->subYear());
    }
}
