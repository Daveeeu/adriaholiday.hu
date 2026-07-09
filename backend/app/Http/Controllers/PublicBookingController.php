<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\StorePublicBookingRequest;
use App\Mail\NewTourBookingOfficeNotification;
use App\Mail\TourBookingCustomerConfirmation;
use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Services\Booking\BookingFormValidationService;
use App\Support\Booking\TourBookingStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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

        $requestedSeats = max(count($result['passengers']), (int) ($validated['participants'] ?? 0), 1);

        $booking = DB::transaction(function () use ($tour, $validated, $result, $requestedSeats): Booking {
            $this->assertCapacityAvailable($validated['tour_date_id'] ?? null, $requestedSeats);

            return $this->createBooking($tour, $validated, $result);
        });

        $this->sendNotifications($booking, $tour);

        return response()->json([
            'id' => $booking->id,
            'status' => $booking->status,
        ], 201);
    }

    private function assertCapacityAvailable(?int $tourDateId, int $requestedSeats): void
    {
        if (! $tourDateId) {
            return;
        }

        $tourDate = TourDate::query()->whereKey($tourDateId)->lockForUpdate()->first();

        if (! $tourDate || $tourDate->price_box_available_seats === null) {
            return;
        }

        if ($tourDate->price_box_available_seats < $requestedSeats) {
            throw ValidationException::withMessages([
                'tour_date_id' => 'Nincs elég szabad hely erre az időpontra.',
            ]);
        }
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

        $tourDate = ! empty($validated['tour_date_id'])
            ? TourDate::query()->find($validated['tour_date_id'])
            : null;

        return Booking::create([
            'booking_type' => $type,
            'status' => $type === 'tour_booking' ? TourBookingStatus::NEW : 'new',
            'payment_status' => $type === 'tour_booking' ? 'unpaid' : null,
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
            'payload' => [
                'bookingFormTemplateId' => $tour->booking_form_template_id,
                'tourDateId' => $validated['tour_date_id'] ?? null,
                'participants' => $validated['participants'] ?? null,
                'formData' => $formData,
                'passengers' => $passengers,
            ],
        ]);
    }

    private function sendNotifications(Booking $booking, Tour $tour): void
    {
        if ($booking->booking_type !== 'tour_booking') {
            return;
        }

        try {
            $officeAddress = config('mail.office_notifications_address');

            if ($officeAddress) {
                Mail::to($officeAddress)->send(new NewTourBookingOfficeNotification($booking, $tour));
            }

            if ($booking->email) {
                Mail::to($booking->email)->send(new TourBookingCustomerConfirmation($booking, $tour));
            }
        } catch (\Throwable $exception) {
            Log::warning('Failed to send booking notification email.', [
                'booking_id' => $booking->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
