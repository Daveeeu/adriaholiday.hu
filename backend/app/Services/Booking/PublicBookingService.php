<?php

namespace App\Services\Booking;

use App\Models\Booking;
use App\Models\BookingFormField;
use App\Models\Coupon;
use App\Models\Tour;
use App\Models\TourDate;
use App\Services\Newsletter\NewsletterSubscriptionService;
use App\Support\Analytics\BookingAnalyticsContext;
use App\Support\Booking\TourBookingSelection;
use App\Support\Booking\TourBookingStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Creates a Booking from a validated public booking submission: prices it
 * on the server, checks the tour date still has enough free seats, redeems
 * the coupon, persists the booking, and triggers the notification emails,
 * including the request for any details the customer left for later.
 */
class PublicBookingService
{
    public function __construct(
        private readonly BookingNotificationService $notifications,
        private readonly TourBookingPriceCalculator $priceCalculator,
        private readonly NewsletterSubscriptionService $newsletter,
        private readonly BookingDetailsRequestService $detailsRequest,
    ) {}

    /**
     * @param  array<string, mixed>  $validated
     * @param  array{formData: array<string, mixed>, passengers: array<int, array<string, mixed>>, pendingDetails?: array<string, mixed>}  $result
     */
    public function submit(Tour $tour, array $validated, array $result): Booking
    {
        $requestedSeats = max(count($result['passengers']), (int) ($validated['participants'] ?? 0), 1);

        $tourDate = ! empty($validated['tour_date_id'])
            ? TourDate::query()->find($validated['tour_date_id'])
            : null;

        $pricing = ($validated['type'] ?? 'tour_booking') === 'tour_booking'
            ? $this->priceCalculator->calculate($tour, $tourDate, TourBookingSelection::fromValidated($validated, $requestedSeats))
            : null;

        $booking = DB::transaction(function () use ($tour, $tourDate, $validated, $result, $requestedSeats, $pricing): Booking {
            $this->ensureSeatsFree($tourDate?->id, $requestedSeats);
            $this->redeemCoupon($pricing['coupon']['id'] ?? null);

            return $this->createBooking($tour, $tourDate, $validated, $result, $pricing);
        });

        $this->notifications->sendNewBookingNotifications($booking, $tour);
        $this->detailsRequest->send($booking);

        // The booking form's "Szeretnék hírlevélben értesülni" box, as on the legacy site.
        if (($validated['newsletter_subscribe'] ?? false) && filled($booking->email)) {
            $this->newsletter->subscribe((string) $booking->email);
        }

        return $booking;
    }

    /**
     * Locks the tour date row and checks its free seats inside the booking
     * transaction: the booking created after it holds its seats from then
     * on, and a concurrent submission for the same date waits for the lock
     * and then counts it, so the date cannot be overbooked.
     */
    private function ensureSeatsFree(?int $tourDateId, int $requestedSeats): void
    {
        if (! $tourDateId) {
            return;
        }

        $freeSeats = TourDate::query()->whereKey($tourDateId)->lockForUpdate()->first()?->freeSeats();

        if ($freeSeats !== null && $freeSeats < $requestedSeats) {
            throw ValidationException::withMessages([
                'tour_date_id' => $freeSeats === 0
                    ? 'Erre az időpontra már nincs szabad hely.'
                    : "Erre az időpontra már csak {$freeSeats} szabad hely van.",
            ]);
        }
    }

    /**
     * Marks the priced coupon as used inside the booking transaction, locking
     * it so two simultaneous bookings cannot both redeem it.
     */
    private function redeemCoupon(?int $couponId): void
    {
        if ($couponId === null) {
            return;
        }

        $coupon = Coupon::query()->whereKey($couponId)->where('used', false)->lockForUpdate()->first();

        if ($coupon === null) {
            throw ValidationException::withMessages([
                'couponCode' => 'A megadott kuponkód már fel lett használva.',
            ]);
        }

        $coupon->update(['used' => true]);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  array{formData: array<string, mixed>, passengers: array<int, array<string, mixed>>, pendingDetails?: array<string, mixed>}  $result
     * @param  array<string, mixed>|null  $pricing  breakdown from TourBookingPriceCalculator
     */
    private function createBooking(Tour $tour, ?TourDate $tourDate, array $validated, array $result, ?array $pricing): Booking
    {
        $type = $validated['type'] ?? 'tour_booking';
        $formData = $result['formData'];
        $passengers = $result['passengers'];

        return Booking::create([
            'booking_type' => $type,
            'status' => $type === 'tour_booking' ? TourBookingStatus::NEW : 'new',
            'payment_status' => $type === 'tour_booking' ? 'unpaid' : null,
            'tour_id' => $tour->id,
            'tour_date_id' => $tourDate?->id,
            'offer_name_snapshot' => $tour->name,
            ...collect(BookingFormField::CONTACT_COLUMNS)
                ->mapWithKeys(fn (string $column, string $key): array => [$column => $formData[$key] ?? null])
                ->all(),
            'passenger_count' => count($passengers) ?: ($validated['participants'] ?? null),
            'departure_date' => $tourDate?->start_date,
            'notes' => $formData['note'] ?? null,
            'message' => $validated['note'] ?? null,
            'coupon_code' => $validated['coupon_code'] ?? null,
            'total_amount' => $pricing['total'] ?? null,
            'currency' => $pricing['currency'] ?? 'HUF',
            'payload' => [
                'bookingFormTemplateId' => $tour->booking_form_template_id,
                'tourDateId' => $validated['tour_date_id'] ?? null,
                'participants' => $validated['participants'] ?? null,
                'formData' => $formData,
                'passengers' => $passengers,
                // Deferred fields left empty, asked for later by e-mail.
                ...(($result['pendingDetails'] ?? []) !== [] ? ['pendingDetails' => $result['pendingDetails']] : []),
                'pricing' => $pricing,
                // Proof that the customer accepted the terms and the privacy policy.
                'termsAcceptedAt' => now()->toIso8601String(),
                // Proof that the customer accepted the transfer of their data to SimplePay.
                ...(($validated['payment_data_transfer_accepted'] ?? false) ? ['paymentDataTransferAcceptedAt' => now()->toIso8601String()] : []),
                'googleAnalytics' => BookingAnalyticsContext::fromValidated($validated),
            ],
        ]);
    }
}
