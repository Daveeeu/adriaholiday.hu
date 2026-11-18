<?php

namespace App\Services\Tour;

use App\Models\TourDate;
use App\Support\Tour\TourDateCapacity;

/**
 * Sets every upcoming departure's capacity to the default of its tour's
 * travel mode (see TourDateCapacity). A departure whose live bookings already
 * hold more passengers keeps exactly that many seats, so it shows as sold out
 * instead of going below its bookings. Departed dates stay as history.
 */
class TourDateCapacityReset
{
    /**
     * @return array{changed: int, unchanged: int, overbooked: list<array{tour: string, date: string, seatsHeld: int, capacity: int}>}
     */
    public function run(bool $dryRun = false): array
    {
        $result = ['changed' => 0, 'unchanged' => 0, 'overbooked' => []];

        TourDate::query()
            ->upcoming()
            ->whereHas('tour')
            ->with('tour:id,name,travel_mode_id')
            ->withSeatsHeld()
            ->chunkById(200, function ($dates) use (&$result, $dryRun): void {
                foreach ($dates as $date) {
                    $default = TourDateCapacity::defaultFor($date->tour->travel_mode_id);
                    $capacity = max($default, $date->seatsHeld());

                    if ($capacity > $default) {
                        $result['overbooked'][] = [
                            'tour' => (string) $date->tour->name,
                            'date' => $date->start_date?->toDateString() ?? '',
                            'seatsHeld' => $date->seatsHeld(),
                            'capacity' => $default,
                        ];
                    }

                    if ($date->capacity === $capacity) {
                        $result['unchanged']++;

                        continue;
                    }

                    $result['changed']++;

                    if (! $dryRun) {
                        // Saved one by one so the activity log records each change.
                        $date->update(['capacity' => $capacity]);
                    }
                }
            });

        return $result;
    }
}
