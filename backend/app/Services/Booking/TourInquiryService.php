<?php

namespace App\Services\Booking;

use App\Models\Booking;
use App\Models\Tour;
use App\Support\Booking\TourInquiry;

/**
 * Stores a public group quote request for a custom date and notifies the
 * office, which answers it with a tailored offer.
 */
class TourInquiryService
{
    public function __construct(private readonly BookingNotificationService $notifications) {}

    /**
     * @param  array<string, mixed>  $validated  StoreTourInquiryRequest data
     */
    public function submit(array $validated): Booking
    {
        $tour = Tour::query()->findOrFail($validated['tour_id']);

        $inquiry = Booking::create([
            'booking_type' => TourInquiry::BOOKING_TYPE,
            'status' => 'new',
            'tour_id' => $tour->id,
            'offer_name_snapshot' => $tour->name,
            'customer_name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['street'] ?? null,
            'city' => $validated['city'] ?? null,
            'arrival' => $validated['date_from'],
            'departure' => $validated['date_to'],
            'passenger_count' => $validated['passenger_count'],
            'message' => $validated['message'] ?? null,
            'payload' => [
                'postalCode' => $validated['postal_code'] ?? null,
                'privacyAccepted' => true,
            ],
        ]);

        $this->notifications->sendNewInquiryNotification($inquiry, $tour);

        return $inquiry;
    }
}
