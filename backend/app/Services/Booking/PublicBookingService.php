<?php

namespace App\Services\Booking;

use App\Models\Booking;
use App\Models\Coupon;
use App\Models\Tour;
use App\Models\TourDate;
use App\Support\Booking\TourBookingStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Creates a Booking from a validated public booking submission: checks
 * the tour date still has enough free seats, persists the booking, and
 * triggers the office/customer notification emails.
 */
class PublicBookingService
{
    public function __construct(private readonly BookingNotificationService $notifications) {}

    /**
     * @param  array<string, mixed>  $validated
     * @param  array{formData: array<string, mixed>, passengers: array<int, array<string, mixed>>}  $result
     */
    public function submit(Tour $tour, array $validated, array $result): Booking
    {
        $requestedSeats = max(count($result['passengers']), (int) ($validated['participants'] ?? 0), 1);

        $booking = DB::transaction(function () use ($tour, $validated, $result, $requestedSeats): Booking {
            $seatsReserved = $this->reserveCapacity($validated['tour_date_id'] ?? null, $requestedSeats);
            $coupon = $this->reserveCoupon($validated['coupon_code'] ?? null, $tour);

            return $this->createBooking($tour, $validated, $result, $seatsReserved, $coupon);
        });

        $this->notifications->sendNewBookingNotifications($booking, $tour);

        return $booking;
    }

    /**
     * Locks the tour date row, checks remaining capacity, and immediately
     * decrements it within the same transaction so that the availability
     * check and the seat hold are a single atomic operation. This prevents
     * concurrent submissions for the same date from all seeing the same
     * "seats available" snapshot and all succeeding (overbooking).
     *
     * Returns whether a seat hold was actually taken (false when the tour
     * date has no tracked capacity), so the caller can record it on the
     * booking and later transitions know not to reserve again.
     */
    private function reserveCapacity(?int $tourDateId, int $requestedSeats): bool
    {
        if (! $tourDateId) {
            return false;
        }

        $tourDate = TourDate::query()->whereKey($tourDateId)->lockForUpdate()->first();

        if (! $tourDate || $tourDate->price_box_available_seats === null) {
            return false;
        }

        if ($tourDate->price_box_available_seats < $requestedSeats) {
            throw ValidationException::withMessages([
                'tour_date_id' => 'Nincs elég szabad hely erre az időpontra.',
            ]);
        }

        $tourDate->decrement('price_box_available_seats', $requestedSeats);

        return true;
    }

    /**
     * Locks the coupon row and re-checks eligibility/usability inside the
     * transaction (the FormRequest already checked this, but without a
     * lock) so two concurrent submissions can't both redeem the last use
     * of a limited coupon. Increments the usage counter immediately.
     */
    private function reserveCoupon(?string $couponCode, Tour $tour): ?Coupon
    {
        $couponCode = trim((string) $couponCode);

        if ($couponCode === '') {
            return null;
        }

        $coupon = Coupon::query()->where('code', $couponCode)->lockForUpdate()->first();

        if (! $coupon || ! $tour->couponable || ! $coupon->isUsable()) {
            throw ValidationException::withMessages([
                'coupon_code' => 'A megadott kuponkód nem érvényes vagy lejárt.',
            ]);
        }

        $coupon->increment('used_count');

        if ($coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses) {
            $coupon->update(['used' => true]);
        }

        return $coupon;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  array{formData: array<string, mixed>, passengers: array<int, array<string, mixed>>}  $result
     */
    private function createBooking(Tour $tour, array $validated, array $result, bool $seatsReserved, ?Coupon $coupon): Booking
    {
        $type = $validated['type'] ?? 'tour_booking';
        $formData = $result['formData'];
        $passengers = $result['passengers'];

        $tourDate = ! empty($validated['tour_date_id'])
            ? TourDate::query()->find($validated['tour_date_id'])
            : null;

        return Booking::create([
            'booking_type' => $type,
            'status' => $type === 'tour_booking' ? TourBookingStatus::NEW : 'new',
            'payment_status' => $type === 'tour_booking' ? 'unpaid' : null,
            'seats_reserved' => $seatsReserved,
            'tour_id' => $tour->id,
            'tour_date_id' => $tourDate?->id,
            'offer_name_snapshot' => $tour->name,
            'customer_name' => $formData['contact_name'] ?? null,
            'email' => $formData['contact_email'] ?? null,
            'phone' => $formData['contact_phone'] ?? null,
            'city' => $formData['contact_city'] ?? null,
            'passenger_count' => count($passengers) ?: ($validated['participants'] ?? null),
            'departure_date' => $tourDate?->start_date,
            'notes' => $formData['note'] ?? null,
            'message' => $validated['note'] ?? null,
            'coupon_code' => $validated['coupon_code'] ?? null,
            'coupon_id' => $coupon?->id,
            'payload' => [
                'bookingFormTemplateId' => $tour->booking_form_template_id,
                'tourDateId' => $validated['tour_date_id'] ?? null,
                'participants' => $validated['participants'] ?? null,
                'formData' => $formData,
                'passengers' => $passengers,
            ],
        ]);
    }
}
