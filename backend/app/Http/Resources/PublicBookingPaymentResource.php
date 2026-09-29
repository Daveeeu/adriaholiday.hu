<?php

namespace App\Http\Resources;

use App\Models\BookingPayment;
use App\Services\Booking\BookingPaymentService;
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
            'paymentId' => $this->provider_payment_id,
            'status' => $this->status,
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
}
