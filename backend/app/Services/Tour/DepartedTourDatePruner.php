<?php

namespace App\Services\Tour;

use App\Models\TourDate;

/**
 * Soft deletes the tour dates whose departure day has passed, so the tour
 * editor lists only the dates still ahead. The tours themselves stay (the
 * nightly ExpiredTourService switches off those left without an upcoming
 * date), and bookings still reach their date, since Booking::tourDate()
 * includes deleted ones. Dates without a start date are left alone.
 */
class DepartedTourDatePruner
{
    /**
     * @return array{dates: int, tours: int}
     */
    public function run(bool $dryRun = false): array
    {
        $departed = TourDate::query()->departed();

        $result = [
            'dates' => (clone $departed)->count(),
            'tours' => (clone $departed)->distinct()->count('tour_id'),
        ];

        if (! $dryRun && $result['dates'] > 0) {
            // One update instead of a model event per date: the public site and
            // the partner feeds only ever show upcoming dates, so no cache changes.
            $departed->delete();
        }

        return $result;
    }
}
