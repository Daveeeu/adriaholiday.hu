<?php

namespace App\Services\Booking;

use App\Models\AnalyticsEvent;
use App\Models\Booking;
use App\Models\TourDate;
use App\Support\Analytics\AnalyticsEventName;
use App\Support\Booking\TourBookingStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Applies a status transition to a tour_booking, reserving or releasing
 * the tour date's seat capacity as the booking moves in and out of the
 * "confirmed" state, and records a booking_status_change analytics event.
 */
class TourBookingStatusService
{
    public function transition(Booking $booking, string $nextStatus, ?int $actorId = null): Booking
    {
        $currentStatus = $booking->status;

        if (! TourBookingStatus::canTransition($currentStatus, $nextStatus)) {
            throw ValidationException::withMessages([
                'status' => "A foglalás állapota nem váltható \"{$currentStatus}\" állapotból \"{$nextStatus}\" állapotba.",
            ]);
        }

        DB::transaction(function () use ($booking, $currentStatus, $nextStatus): void {
            $seatsReserved = $booking->seats_reserved;

            if ($nextStatus === TourBookingStatus::CONFIRMED && ! $seatsReserved) {
                $seatsReserved = $this->reserveSeats($booking);
            }

            if ($currentStatus === TourBookingStatus::CONFIRMED
                && in_array($nextStatus, [TourBookingStatus::CANCELLED, TourBookingStatus::EXPIRED], true)
                && $seatsReserved) {
                $this->releaseSeats($booking);
                $seatsReserved = false;
            }

            $booking->update(['status' => $nextStatus, 'seats_reserved' => $seatsReserved]);
        });

        $this->recordStatusChangeEvent($booking, $currentStatus, $nextStatus, $actorId);

        return $booking->refresh();
    }

    private function reserveSeats(Booking $booking): bool
    {
        if (! $booking->tour_date_id) {
            return false;
        }

        $tourDate = TourDate::query()->whereKey($booking->tour_date_id)->lockForUpdate()->first();

        if (! $tourDate || $tourDate->price_box_available_seats === null) {
            return false;
        }

        $requested = $booking->passenger_count ?: 1;

        if ($tourDate->price_box_available_seats < $requested) {
            throw ValidationException::withMessages([
                'status' => 'Nincs elég szabad hely a megerősítéshez ezen az időponton.',
            ]);
        }

        $tourDate->decrement('price_box_available_seats', $requested);

        return true;
    }

    private function releaseSeats(Booking $booking): void
    {
        if (! $booking->tour_date_id) {
            return;
        }

        $tourDate = TourDate::query()->whereKey($booking->tour_date_id)->lockForUpdate()->first();

        if ($tourDate && $tourDate->price_box_available_seats !== null) {
            $tourDate->increment('price_box_available_seats', $booking->passenger_count ?: 1);
        }
    }

    private function recordStatusChangeEvent(Booking $booking, string $from, string $to, ?int $actorId): void
    {
        $adminPath = "/admin/bookings/tour-bookings/{$booking->id}";

        AnalyticsEvent::query()->create([
            'event_id' => (string) Str::uuid(),
            'session_id' => 'admin',
            'visitor_id' => 'admin',
            'user_id' => $actorId,
            'event_name' => AnalyticsEventName::BOOKING_STATUS_CHANGE,
            'entity_type' => 'booking',
            'entity_id' => (string) $booking->id,
            'page_url' => $adminPath,
            'page_path' => $adminPath,
            'metadata' => [
                'from_status' => $from,
                'to_status' => $to,
                'tour_id' => $booking->tour_id,
            ],
            'consent_analytics' => true,
            'consent_marketing' => false,
        ]);
    }
}
