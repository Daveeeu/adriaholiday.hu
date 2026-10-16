<?php

namespace App\Services\Booking;

use App\Models\Apartment;
use App\Models\Booking;
use App\Services\Newsletter\NewsletterSubscriptionService;
use App\Support\Apartment\ApartmentPriceTable;
use Illuminate\Validation\ValidationException;

/**
 * Records a booking request sent from an apartment's page. The office
 * confirms the stay and sends the deposit invoice, as with the legacy site,
 * so the booking starts as "new" without a price; the office and the
 * customer are notified.
 */
class ApartmentBookingService
{
    public const BOOKING_TYPE = 'apartment_booking';

    public function __construct(
        private readonly BookingNotificationService $notifications,
        private readonly NewsletterSubscriptionService $newsletter,
    ) {}

    /**
     * @param  array<string, mixed>  $validated  see StoreApartmentBookingRequest
     *
     * @throws ValidationException when the apartment type is not one of the apartment's
     */
    public function submit(Apartment $apartment, array $validated): Booking
    {
        $types = ApartmentPriceTable::categories($apartment->pricing_matrix);
        $type = trim((string) ($validated['apartment_type'] ?? ''));

        if ($types !== [] && ! in_array($type, $types, true)) {
            throw ValidationException::withMessages(['apartment_type' => 'Válassz apartmantípust az apartman típusai közül.']);
        }

        $passengers = array_map(fn (array $passenger): array => array_filter([
            'name' => trim((string) $passenger['name']),
            'birthDate' => $passenger['birth_date'],
            'address' => $this->filled($passenger['address'] ?? null),
            'documentNumber' => $this->filled($passenger['document_number'] ?? null),
        ], fn (mixed $value): bool => $value !== null), array_values($validated['passengers']));

        $booking = Booking::query()->create([
            'booking_type' => self::BOOKING_TYPE,
            'status' => 'new',
            'apartment_id' => $apartment->id,
            'region_id' => $apartment->region_id,
            'location_id' => $apartment->location_id,
            'apartment_name_snapshot' => $apartment->name,
            'offer_code' => $apartment->code,
            'customer_name' => trim((string) $validated['customer_name']),
            'email' => $validated['email'],
            'phone' => $this->filled($validated['phone'] ?? null),
            'city' => $this->filled($validated['city'] ?? null),
            'address' => $this->filled($validated['address'] ?? null),
            'passenger_count' => count($passengers),
            'adults' => count($passengers),
            'arrival' => $validated['arrival'],
            'departure' => $validated['departure'],
            'check_in' => $validated['arrival'],
            'check_out' => $validated['departure'],
            'application_date' => now(),
            'currency' => 'EUR',
            'message' => $this->filled($validated['message'] ?? null),
            'payload' => array_filter([
                'postalCode' => $this->filled($validated['postal_code'] ?? null),
                'apartmentType' => $type !== '' ? $type : null,
                'travelInsurance' => (bool) $validated['travel_insurance'],
                'cancellationInsurance' => (bool) $validated['cancellation_insurance'],
                'passengers' => $passengers,
                // Proof that the customer accepted the terms and the privacy policy.
                'termsAcceptedAt' => now()->toIso8601String(),
            ], fn (mixed $value): bool => $value !== null),
        ]);

        $this->notifications->sendNewApartmentBookingNotifications($booking, $apartment);

        if ($validated['newsletter_subscribe'] ?? false) {
            $this->newsletter->subscribe((string) $booking->email);
        }

        return $booking;
    }

    private function filled(mixed $value): ?string
    {
        $value = is_string($value) ? trim($value) : null;

        return $value !== null && $value !== '' ? $value : null;
    }
}
