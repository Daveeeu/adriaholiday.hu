<?php

namespace App\Services\Legacy;

use App\Models\Booking;
use App\Models\TourDate;
use App\Support\Legacy\LegacyDateRun;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Takes legacy bookings made for an earlier run of a reused legacy date (see
 * LegacyDateRun) off the later run they were imported onto: they lose that
 * run's date and departure day, so they no longer hold its seats.
 *
 * The 2026-11-16 capacity migration counted those bookings as held seats and
 * raised each date's capacity by them to keep its free seats. The capacity
 * goes down by the same seats here, so every date keeps its free seats while
 * its booked passengers and capacity become the real ones.
 */
class LegacyEarlierRunDetacher
{
    /**
     * @return array{bookings: int, dates: array<int, array{id: int, tour: string|null, start_date: string|null, bookings: int, seats: int, capacity_before: int|null, capacity_after: int|null}>}
     */
    public function detach(bool $dryRun): array
    {
        $bookings = $this->earlierRunBookings();
        $seats = $this->seatsHeldByDate($bookings);
        $dates = TourDate::withTrashed()->with('tour:id,name')->whereKey($bookings->pluck('tour_date_id')->filter()->unique())->orderBy('id')->get();

        $report = $dates->map(function (TourDate $date) use ($bookings, $seats): array {
            $released = $seats[$date->id] ?? 0;

            return [
                'id' => $date->id,
                'tour' => $date->tour?->name,
                'start_date' => $date->start_date?->toDateString(),
                'bookings' => $bookings->where('tour_date_id', $date->id)->count(),
                'seats' => $released,
                'capacity_before' => $date->capacity,
                'capacity_after' => $date->capacity === null ? null : max(0, $date->capacity - $released),
            ];
        })->values()->all();

        if (! $dryRun) {
            DB::transaction(function () use ($bookings, $dates, $report): void {
                $bookings->each(fn (Booking $booking): bool => $booking->fill(['tour_date_id' => null, 'departure_date' => null])->save());

                foreach ($report as $row) {
                    $dates->firstWhere('id', $row['id'])->fill(['capacity' => $row['capacity_after']])->save();
                }
            });
        }

        return ['bookings' => $bookings->count(), 'dates' => $report];
    }

    /**
     * @return Collection<int, Booking>
     */
    private function earlierRunBookings(): Collection
    {
        return Booking::query()
            ->where('booking_type', 'tour_booking')
            ->whereNotNull('payload->legacy->id')
            ->whereNotNull('departure_date')
            ->whereNotNull('booking_date')
            ->get(['id', 'tour_date_id', 'departure_date', 'booking_date'])
            ->filter(fn (Booking $booking): bool => LegacyDateRun::isEarlierRun($booking->booking_date, $booking->departure_date))
            ->values();
    }

    /**
     * The seats the bookings hold on their dates, counted as the dates count them.
     *
     * @param  Collection<int, Booking>  $bookings
     * @return array<int, int>
     */
    private function seatsHeldByDate(Collection $bookings): array
    {
        return Booking::query()
            ->whereKey($bookings->pluck('id')->all())
            ->whereNotNull('tour_date_id')
            ->holdingSeats()
            ->groupBy('tour_date_id')
            ->selectRaw('tour_date_id, SUM('.Booking::SEATS_HELD.') as seats')
            ->pluck('seats', 'tour_date_id')
            ->map(fn (mixed $seats): int => (int) $seats)
            ->all();
    }
}
