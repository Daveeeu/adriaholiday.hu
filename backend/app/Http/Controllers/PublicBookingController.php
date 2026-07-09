<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\StorePublicBookingRequest;
use App\Models\Tour;
use App\Services\Booking\BookingFormValidationService;
use App\Services\Booking\PublicBookingService;
use Illuminate\Validation\ValidationException;

class PublicBookingController extends Controller
{
    public function store(
        StorePublicBookingRequest $request,
        BookingFormValidationService $validationService,
        PublicBookingService $bookingService,
    ) {
        $validated = $request->validated();

        $tour = Tour::query()
            ->with('bookingFormTemplate.templateFields.field')
            ->findOrFail($validated['tour_id']);

        $result = $validationService->validate(
            $tour,
            $validated['form_data'] ?? [],
            $validated['passengers'] ?? [],
        );

        if ($result['errors'] !== []) {
            throw ValidationException::withMessages($result['errors']);
        }

        $booking = $bookingService->submit($tour, $validated, $result);

        return response()->json([
            'id' => $booking->id,
            'status' => $booking->status,
        ], 201);
    }
}
