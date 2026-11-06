<?php

namespace App\Http\Resources;

use App\Models\BookingPayment;
use App\Services\Booking\BookingPaymentService;
use App\Services\Payment\SimplePay\SimplePayClient;
use App\Support\Payment\BookingPaymentStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The outcome of an online payment shown to the customer on the payment
 * result page. Deliberately contains no personal data of the booking.
 *
 * @mixin BookingPayment
 */
class PublicBookingPaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'reference' => $this->payment_request_id,
            'status' => $this->status,
            'failure' => $this->failure(),
            'transactionId' => in_array($this->failure(), ['cancelled', 'timeout'], true) ? null : $this->provider_payment_id,
            'kind' => $this->kind,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'bookingId' => $this->booking_id,
            'tourName' => $this->booking?->offer_name_snapshot,
            'canRetry' => $this->status === BookingPaymentStatus::FAILED
                && $this->booking !== null
                && app(BookingPaymentService::class)->canStart($this->booking),
        ];
    }

    /**
     * Why the payment failed, as far as the customer may be told. SimplePay
     * forbids naming a decline's real reason, and a cancelled or timed out
     * payment must not be presented as a failed one.
     */
    private function failure(): ?string
    {
        if ($this->status !== BookingPaymentStatus::FAILED) {
            return null;
        }

        return match ($this->provider_status) {
            SimplePayClient::CANCELLED => 'cancelled',
            SimplePayClient::TIMEOUT => 'timeout',
            default => 'declined',
        };
    }
}
