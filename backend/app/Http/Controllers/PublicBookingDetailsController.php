<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\CompleteBookingDetailsRequest;
use App\Http\Resources\PublicBookingDetailsResource;
use App\Models\Booking;
use App\Services\Booking\BookingDetailsRequestService;
use Illuminate\Http\Response;

/**
 * The public page where a customer gives the booking details they left for
 * later. The booking is addressed by the random token of the e-mailed link,
 * which stops working once the details are given.
 */
class PublicBookingDetailsController extends Controller
{
    public function __construct(private readonly BookingDetailsRequestService $detailsRequest) {}

    public function show(string $token): PublicBookingDetailsResource
    {
        return new PublicBookingDetailsResource($this->findPending($token));
    }

    public function complete(CompleteBookingDetailsRequest $request, string $token): Response
    {
        $this->detailsRequest->complete(
            $this->findPending($token),
            $request->validated('form_data') ?? [],
            $request->validated('passengers') ?? [],
        );

        return response()->noContent();
    }

    private function findPending(string $token): Booking
    {
        $booking = $this->detailsRequest->findByToken($token);

        abort_if(
            $booking === null || $this->detailsRequest->isEmpty($this->detailsRequest->pendingFields($booking)),
            404,
            'Ez a link már nem érvényes.',
        );

        return $booking;
    }
}
