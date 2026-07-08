<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\StorePublicBookingRequest;
use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Services\Booking\BookingFormValidationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PublicBookingController extends Controller
{
    public function store(StorePublicBookingRequest $request, BookingFormValidationService $validationService)
    {
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

        $booking = DB::transaction(fn () => $this->createBooking($tour, $validated, $result));

        return response()->json([
            'id' => $booking->id,
            'status' => $booking->status,
        ], 201);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  array{formData: array<string, mixed>, passengers: array<int, array<string, mixed>>}  $result
     */
    private function createBooking(Tour $tour, array $validated, array $result): Booking
    {
        $type = $validated['type'] ?? 'tour_booking';
        $formData = $result['formData'];
        $passengers = $result['passengers'];

        $departureDate = ! empty($validated['tour_date_id'])
            ? TourDate::query()->find($validated['tour_date_id'])?->start_date
            : null;

        return Booking::create([
            'booking_type' => $type,
            'status' => $type === 'tour_inquiry' ? 'new' : 'pending',
            'payment_status' => $type === 'tour_booking' ? 'unpaid' : null,
            'tour_id' => $tour->id,
            'offer_name_snapshot' => $tour->name,
            'customer_name' => $formData['contact_name'] ?? null,
            'email' => $formData['contact_email'] ?? null,
            'phone' => $formData['contact_phone'] ?? null,
            'city' => $formData['contact_city'] ?? null,
            'passenger_count' => count($passengers) ?: ($validated['participants'] ?? null),
            'departure_date' => $departureDate,
            'notes' => $formData['note'] ?? null,
            'message' => $validated['note'] ?? null,
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
