<?php

namespace App\Jobs;

use App\Models\BookingPayment;
use App\Services\Analytics\GoogleAnalyticsMeasurementProtocol;
use App\Support\Payment\BookingPaymentStatus;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;

/**
 * Reports a succeeded online payment to GA4 as a purchase of the booked tour,
 * for the visitor the booking was made by. GA4 deduplicates purchases by
 * transaction id, so a retried job cannot count the payment twice.
 */
class SendGooglePurchaseEventJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $bookingPaymentId,
    ) {}

    public function handle(GoogleAnalyticsMeasurementProtocol $measurementProtocol): void
    {
        $payment = BookingPayment::query()->with('booking.tour')->find($this->bookingPaymentId);
        $booking = $payment?->booking;
        $visitor = $booking?->payload['googleAnalytics'] ?? null;

        if ($payment === null || $payment->status !== BookingPaymentStatus::SUCCEEDED || ! is_array($visitor)) {
            return;
        }

        $value = (float) $payment->amount;
        $quantity = max(1, (int) $booking->passenger_count);
        $tour = $booking->tour;

        $measurementProtocol->send(
            clientId: (string) $visitor['clientId'],
            eventName: 'purchase',
            params: [
                'transaction_id' => "booking-{$booking->id}-payment-{$payment->id}",
                'value' => $value,
                'currency' => $payment->currency ?? $booking->currency ?? 'HUF',
                'payment_kind' => $payment->kind,
                'booking_type' => 'tour_booking',
                'items' => [[
                    'item_id' => $tour !== null ? Str::after($tour->publicPath(), '/ajanlat/') : "booking-{$booking->id}",
                    'item_name' => $booking->offer_name_snapshot ?? $tour?->name ?? '',
                    'item_category' => 'tour',
                    'item_variant' => $booking->departure_date?->toDateString(),
                    'price' => round($value / $quantity, 2),
                    'quantity' => $quantity,
                ]],
            ],
            sessionId: isset($visitor['sessionId']) ? (string) $visitor['sessionId'] : null,
        );
    }
}
