<?php

namespace App\Support\Booking;

/**
 * What the customer chose on the public booking form that affects the
 * price: departure place, optional extras (and a choice for extras that
 * offer one), insurances and a coupon code.
 */
final class TourBookingSelection
{
    /**
     * @param  array<int, int>  $extraIds
     * @param  array<int, string>  $extraChoices  keyed by extra id
     */
    public function __construct(
        public readonly int $passengers,
        public readonly ?int $departurePlaceId = null,
        public readonly array $extraIds = [],
        public readonly array $extraChoices = [],
        public readonly bool $travelInsurance = false,
        public readonly bool $cancellationInsurance = false,
        public readonly ?string $couponCode = null,
    ) {}

    /**
     * @param  array<string, mixed>  $validated  StorePublicBookingRequest data
     */
    public static function fromValidated(array $validated, int $passengers): self
    {
        $couponCode = trim((string) ($validated['coupon_code'] ?? ''));

        return new self(
            passengers: max(1, $passengers),
            departurePlaceId: isset($validated['departure_place_id']) ? (int) $validated['departure_place_id'] : null,
            extraIds: array_values(array_unique(array_map('intval', $validated['extra_ids'] ?? []))),
            extraChoices: collect($validated['extra_choices'] ?? [])
                ->mapWithKeys(fn (mixed $choice, int|string $extraId): array => [(int) $extraId => trim((string) $choice)])
                ->all(),
            travelInsurance: (bool) ($validated['travel_insurance'] ?? false),
            cancellationInsurance: (bool) ($validated['cancellation_insurance'] ?? false),
            couponCode: $couponCode !== '' ? $couponCode : null,
        );
    }
}
