<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\SimplePayReturnRequest;
use App\Http\Resources\PublicBookingPaymentResource;
use App\Models\BookingPayment;
use App\Services\Booking\BookingPaymentService;
use App\Services\Payment\SimplePay\SimplePayClient;
use App\Services\Payment\SimplePay\SimplePayException;
use App\Support\Payment\BookingPaymentStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Public side of the SimplePay payment flow: the gateway's IPN and the
 * customer's return, the result page's status query and retrying a failed
 * payment. SimplePay's transaction ids are sequential, so the public routes
 * address a payment by its unguessable payment_request_id, which only the
 * customer (through the signed return) and SimplePay know.
 */
class PublicBookingPaymentController extends Controller
{
    public function __construct(
        private readonly BookingPaymentService $payments,
        private readonly SimplePayClient $simplePay,
    ) {}

    public function notification(Request $request): Response
    {
        try {
            $notification = $this->simplePay->readNotification($request->getContent(), $request->header('Signature'));
        } catch (SimplePayException) {
            abort(400);
        }

        $payment = $this->payments->sync($this->payments->findByOrderRef($notification['orderRef']));

        // Not confirming makes SimplePay repeat the message until the state
        // could be read, so a paid booking is not left uncredited.
        if (! BookingPaymentStatus::isFinal($payment->status)) {
            return response('', 503);
        }

        $confirmation = $this->simplePay->confirmNotification($notification);

        return response($confirmation['body'], 200, [
            'Content-Type' => 'application/json',
            'Signature' => $confirmation['signature'],
        ]);
    }

    public function return(SimplePayReturnRequest $request): PublicBookingPaymentResource
    {
        try {
            $orderRef = $this->simplePay->orderRefOfReturn($request->validated('r'), $request->validated('s'));
        } catch (SimplePayException) {
            abort(404);
        }

        return new PublicBookingPaymentResource($this->payments->sync($this->payments->findByOrderRef($orderRef))->load('booking'));
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
