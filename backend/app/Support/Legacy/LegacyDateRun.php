<?php

namespace App\Support\Legacy;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * The legacy admin reuses a tour's date rows year after year: once a run has
 * departed, the office moves the same row to the next run's date, and the
 * row's bookings move with it. A legacy booking therefore names the row's
 * latest date, not the run it was made for. Two signs tell an earlier run's
 * booking apart:
 *
 * - it was made more than a year before the date it names (the row only moves
 *   on after a run departed, about a year before the next one);
 * - the run the legacy admin named when the booking was first imported (the
 *   "Időpont" line of its admin note, which a re-import leaves as it was)
 *   departed more than a month before the date it is now linked to: a row
 *   moved on to a later run, while a run whose day was only adjusted stays
 *   within days of its date.
 */
final class LegacyDateRun
{
    /** Starts the admin note line naming the legacy date at the first import. */
    public const NOTE_DATE_LABEL = 'Időpont: ';

    public static function isEarlierRun(CarbonInterface $bookedAt, CarbonInterface $departure, ?CarbonInterface $recordedDeparture = null): bool
    {
        $day = $departure->copy()->startOfDay();

        return $bookedAt->lt($day->copy()->subYear())
            || ($recordedDeparture !== null && $recordedDeparture->lt($day->copy()->subMonth()));
    }

    /**
     * The first day of the legacy date an imported booking's admin note names,
     * if it names one.
     */
    public static function recordedDeparture(?string $adminNote): ?CarbonImmutable
    {
        $label = preg_quote(self::NOTE_DATE_LABEL, '/');

        if ($adminNote === null || preg_match("/^{$label}(\d{4}-\d{2}-\d{2})/mu", $adminNote, $match) !== 1) {
            return null;
        }

        return CarbonImmutable::createFromFormat('!Y-m-d', $match[1]) ?: null;
    }
}
