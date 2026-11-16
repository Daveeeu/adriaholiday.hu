<?php

namespace App\Services\Booking;

use App\Models\AnalyticsEvent;
use App\Models\Booking;
use App\Support\Analytics\AnalyticsEventName;
use App\Support\Booking\TourBookingStatus;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Applies a status transition to a tour_booking and records a
 * booking_status_change analytics event. Seats need no bookkeeping here:
 * a booking holds its seats until it is cancelled or expires
 * (Booking::scopeHoldingSeats()), and neither status can be left again.
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

        $booking->update(['status' => $nextStatus]);

        $this->recordStatusChangeEvent($booking, $currentStatus, $nextStatus, $actorId);

        return $booking->refresh();
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
