<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\BarionCallbackRequest;
use App\Http\Resources\PublicBookingPaymentResource;
use App\Models\BookingPayment;
use App\Services\Booking\BookingPaymentService;
use App\Support\Payment\BookingPaymentStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

/**
 * Public side of the Barion payment flow: the gateway's callback, the
 * result page's status query and retrying a failed payment. Payments are
 * addressed by Barion's unguessable payment id, which only the customer
 * (via the redirect back from Barion) and Barion itself know.
 */
class PublicBookingPaymentController extends Controller
{
    public function __construct(private readonly BookingPaymentService $payments) {}

    public function callback(BarionCallbackRequest $request): Response
    {
        $payment = BookingPayment::query()
            ->where('provider', BookingPaymentService::PROVIDER)
            ->where('provider_payment_id', $request->validated('payment_id'))
            ->firstOrFail();

        $this->payments->sync($payment);

        return response('', 200);
    }

    public function show(BookingPayment $bookingPayment): PublicBookingPaymentResource
    {
        return new PublicBookingPaymentResource($this->payments->sync($bookingPayment)->load('booking'));
    }

    public function retry(BookingPayment $bookingPayment): JsonResponse
    {
        $payment = $this->payments->sync($bookingPayment);
        $booking = $payment->booking;

        // Only a failed attempt may be replaced, so a customer can never have
        // two open payments for the same booking.
        if ($payment->status !== BookingPaymentStatus::FAILED || $booking === null || ! $this->payments->canStart($booking)) {
            return response()->json(['message' => 'Ehhez a foglaláshoz most nem indítható online fizetés.'], 409);
        }

        $paymentUrl = $this->payments->start($booking);

        if ($paymentUrl === null) {
            return response()->json(['message' => 'A fizetés indítása most nem sikerült, kérjük, próbáld újra később.'], 503);
        }

        return response()->json(['paymentUrl' => $paymentUrl]);
    }
}
