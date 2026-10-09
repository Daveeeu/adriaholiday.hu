<?php

namespace App\Support\Booking;

/**
 * What the customer chose on the public booking form that affects the
 * price: departure place, the extras charged once per booking, each
 * passenger's own extras and insurances, and a coupon code.
 */
final class TourBookingSelection
{
    /**
     * @param  array<int, int>  $bookingExtraIds  extras charged once per booking
     * @param  array<int, string>  $bookingExtraChoices  keyed by extra id
     * @param  array<int, TourBookingPassengerOptions>  $passengerOptions  in passenger order
     */
    public function __construct(
        public readonly int $passengers,
        public readonly ?int $departurePlaceId = null,
        public readonly array $bookingExtraIds = [],
        public readonly array $bookingExtraChoices = [],
        public readonly array $passengerOptions = [],
        public readonly ?string $couponCode = null,
    ) {}

    /**
     * @param  array<string, mixed>  $validated  StorePublicBookingRequest data
     */
    public static function fromValidated(array $validated, int $passengers): self
    {
        $passengers = max(1, $passengers);
        $couponCode = trim((string) ($validated['coupon_code'] ?? ''));
        $booking = TourBookingPassengerOptions::fromArray($validated);

        // A form from before per-passenger options sends one set of extras
        // and insurances, which then apply to every passenger.
        $passengerOptions = array_fill(0, $passengers, $booking);

        if (isset($validated['passenger_options'])) {
            $passengerOptions = array_map(
                fn (array $passenger): TourBookingPassengerOptions => TourBookingPassengerOptions::fromArray($passenger),
                array_values($validated['passenger_options']),
            );
        }

        return new self(
            passengers: $passengers,
            departurePlaceId: isset($validated['departure_place_id']) ? (int) $validated['departure_place_id'] : null,
            bookingExtraIds: $booking->extraIds,
            bookingExtraChoices: $booking->extraChoices,
            passengerOptions: array_slice($passengerOptions, 0, $passengers),
            couponCode: $couponCode !== '' ? $couponCode : null,
        );
    }

    /**
     * The choices of a passenger; one who chose nothing gets no extras or insurance.
     */
    public function optionsOf(int $passengerIndex): TourBookingPassengerOptions
    {
        return $this->passengerOptions[$passengerIndex] ?? new TourBookingPassengerOptions;
    }

    /**
     * Every extra id the booking refers to, at booking or passenger level.
     *
     * @return array<int, int>
     */
    public function referencedExtraIds(): array
    {
        return array_values(array_unique([
            ...$this->bookingExtraIds,
            ...array_merge([], ...array_map(fn (TourBookingPassengerOptions $options): array => $options->extraIds, $this->passengerOptions)),
        ]));
    }
}
