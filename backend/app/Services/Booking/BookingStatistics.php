<?php

namespace App\Services\Booking;

use App\Models\Booking;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Booking figures of a period, by the date the booking came in: how many
 * bookings and inquiries, passengers, revenue and the best-selling trips.
 * Revenue counts what the dashboard counts: the total of tour and apartment
 * bookings that were not cancelled. Amounts are summed per currency (tours
 * are priced in forints, apartments in euros), e.g. {"HUF": 1038051, "EUR": 640}.
 */
class BookingStatistics
{
    public const REVENUE_TYPES = ['tour_booking', 'apartment_booking'];

    /**
     * @return array<string, mixed>
     */
    public function forPeriod(CarbonImmutable $from, CarbonImmutable $to, int $topTripLimit): array
    {
        $bookings = Booking::query()
            ->whereDate('created_at', '>=', $from->toDateString())
            ->whereDate('created_at', '<=', $to->toDateString())
            ->get(['id', 'booking_type', 'status', 'cancelled', 'tour_id', 'offer_name_snapshot', 'apartment_name_snapshot', 'passenger_count', 'total_amount', 'paid_amount', 'currency', 'created_at']);

        $revenueBookings = $bookings->whereIn('booking_type', self::REVENUE_TYPES)->where('cancelled', false);

        return [
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString(), 'counted_by' => 'a foglalás beérkezésének dátuma'],
            'totals' => [
                'bookings_and_inquiries' => $bookings->count(),
                'cancelled' => $bookings->where('cancelled', true)->count(),
                'revenue' => $this->sum($revenueBookings, 'total_amount'),
                'paid' => $this->sum($revenueBookings, 'paid_amount'),
            ],
            'by_type' => $bookings
                ->groupBy('booking_type')
                ->map(fn (Collection $group, string $type): array => [
                    'booking_type' => $type,
                    'count' => $group->count(),
                    'not_cancelled' => $group->where('cancelled', false)->count(),
                    'passengers' => (int) $group->where('cancelled', false)->sum('passenger_count'),
                    'revenue' => in_array($type, self::REVENUE_TYPES, true) ? $this->sum($group->where('cancelled', false), 'total_amount') : null,
                    'by_status' => $group->countBy(fn (Booking $booking): string => (string) ($booking->status ?: 'ismeretlen'))->all(),
                ])
                ->values()
                ->all(),
            'top_trips' => $revenueBookings
                ->groupBy(fn (Booking $booking): string => $booking->booking_type === 'tour_booking'
                    ? 'tour:'.($booking->tour_id ?? $booking->offer_name_snapshot)
                    : 'apartment:'.$booking->apartment_name_snapshot)
                ->map(fn (Collection $group): array => [
                    'name' => (string) ($group->first()->offer_name_snapshot ?? $group->first()->apartment_name_snapshot ?? 'Ismeretlen'),
                    'booking_type' => $group->first()->booking_type,
                    'tour_id' => $group->first()->tour_id,
                    'bookings' => $group->count(),
                    'passengers' => (int) $group->sum('passenger_count'),
                    'revenue' => $this->sum($group, 'total_amount'),
                ])
                ->sortBy([['bookings', 'desc'], ['passengers', 'desc']])
                ->take($topTripLimit)
                ->values()
                ->all(),
            'by_month' => $revenueBookings
                ->groupBy(fn (Booking $booking): string => $booking->created_at->format('Y-m'))
                ->sortKeys()
                ->map(fn (Collection $group, string $month): array => [
                    'month' => $month,
                    'bookings' => $group->count(),
                    'passengers' => (int) $group->sum('passenger_count'),
                    'revenue' => $this->sum($group, 'total_amount'),
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  Collection<int, Booking>  $bookings
     * @return array<string, float>
     */
    private function sum(Collection $bookings, string $column): array
    {
        return $bookings
            ->groupBy(fn (Booking $booking): string => $booking->currency ?: 'HUF')
            ->map(fn (Collection $group): float => round((float) $group->sum(fn (Booking $booking): float => (float) $booking->{$column}), 2))
            ->sortKeys()
            ->all();
    }
}
