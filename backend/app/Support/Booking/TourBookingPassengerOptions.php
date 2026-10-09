<?php

namespace App\Support\Booking;

/**
 * What one passenger chose on the public booking form: the per-person extras
 * (with a choice for extras offering one) and the insurances.
 */
final class TourBookingPassengerOptions
{
    /**
     * @param  array<int, int>  $extraIds
     * @param  array<int, string>  $extraChoices  keyed by extra id
     */
    public function __construct(
        public readonly array $extraIds = [],
        public readonly array $extraChoices = [],
        public readonly bool $travelInsurance = false,
        public readonly bool $cancellationInsurance = false,
    ) {}

    /**
     * @param  array<string, mixed>  $options  extra_ids, extra_choices, travel_insurance, cancellation_insurance
     */
    public static function fromArray(array $options): self
    {
        return new self(
            extraIds: array_values(array_unique(array_map('intval', $options['extra_ids'] ?? []))),
            extraChoices: collect($options['extra_choices'] ?? [])
                ->mapWithKeys(fn (mixed $choice, int|string $extraId): array => [(int) $extraId => trim((string) $choice)])
                ->all(),
            travelInsurance: (bool) ($options['travel_insurance'] ?? false),
            cancellationInsurance: (bool) ($options['cancellation_insurance'] ?? false),
        );
    }
}
