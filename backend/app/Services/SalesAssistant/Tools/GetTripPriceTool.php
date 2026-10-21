<?php

namespace App\Services\SalesAssistant\Tools;

use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Services\Booking\TourBookingPriceCalculator;
use App\Services\SalesAssistant\SalesAssistantToolException;
use App\Services\SalesAssistant\TripCatalog;
use App\Support\Booking\TourBookingSelection;
use App\Support\Tour\TourDateStatus;
use App\Support\Tour\TourExtraChargeRule;
use Illuminate\Validation\ValidationException;

/**
 * The price of a trip for the customer's group, calculated by the same
 * calculator the booking uses, without optional extras, coupons or insurance.
 */
class GetTripPriceTool implements SalesAssistantTool
{
    public const MAX_PASSENGERS = 20;

    public function __construct(
        private readonly TripCatalog $catalog,
        private readonly TourBookingPriceCalculator $calculator,
    ) {}

    public function name(): string
    {
        return 'get_trip_price';
    }

    public function description(): string
    {
        return 'Calculate the indicative catalog price of one departure for a number of passengers, including the pickup fee and mandatory extras. It is not a binding quote: optional extras, coupons and insurance are not included and the office confirms the final price at booking.';
    }

    public function parameters(): array
    {
        return TripArguments::object([
            'slug' => TripArguments::slugSchema(),
            'departure_id' => TripArguments::departureIdSchema('The departure_id from get_trip_departures. Required when the trip has scheduled departures.'),
            'passengers' => ['type' => 'integer', 'minimum' => 1, 'maximum' => self::MAX_PASSENGERS, 'description' => 'Number of travellers.'],
            'pickup_location_id' => TripArguments::departureIdSchema('The pickup_location_id from get_pickup_locations. Required when the trip has pickup locations.'),
        ], ['slug', 'passengers']);
    }

    public function rules(): array
    {
        return [
            'slug' => TripArguments::slugRules(),
            'departure_id' => TripArguments::optionalIdRules(),
            'passengers' => ['required', 'integer', 'min:1', 'max:'.self::MAX_PASSENGERS],
            'pickup_location_id' => TripArguments::optionalIdRules(),
        ];
    }

    public function handle(array $arguments): SalesAssistantToolResult
    {
        $tour = $this->catalog->findTrip($arguments['slug']);
        $date = $this->departure($tour, $arguments['departure_id'] ?? null);
        $passengers = (int) $arguments['passengers'];
        $pricePerPerson = $this->catalog->pricePerPerson($tour, $date);
        $trip = ['slug' => (string) $tour->seo_name, 'name' => (string) $tour->name];

        if ($pricePerPerson === null) {
            return new SalesAssistantToolResult(
                result: [
                    'trip' => $trip,
                    'price_available' => false,
                    'guidance' => 'The catalog has no price for this trip. Do not estimate one: offer that the office sends a personal quote.',
                ],
                trips: collect([$tour]),
            );
        }

        $breakdown = $this->calculate($tour, $date, new TourBookingSelection(
            passengers: $passengers,
            departurePlaceId: $arguments['pickup_location_id'] ?? null,
        ));

        return new SalesAssistantToolResult(
            result: [
                'trip' => $trip,
                'departure' => $date !== null ? ['departure_id' => $date->id, ...$this->catalog->departureDates($date)] : null,
                'availability' => $date !== null ? $this->catalog->availability($date) : null,
                'price_available' => true,
                'currency' => $breakdown['currency'],
                'passengers' => $passengers,
                'price_per_person' => $breakdown['basePrice'],
                'base_total' => $breakdown['baseTotal'],
                'discount' => $breakdown['discount'],
                'pickup_location' => $breakdown['departurePlace'] !== null ? [
                    'name' => $breakdown['departurePlace']['name'],
                    'fee_per_person' => $breakdown['departurePlace']['fee'],
                    'total' => $breakdown['departurePlace']['total'],
                ] : null,
                'mandatory_extras' => array_map(fn (array $extra): array => [
                    'name' => $extra['name'],
                    'quantity' => $extra['quantity'],
                    'total' => $extra['total'],
                ], $breakdown['extras']),
                'paid_on_site' => array_map(fn (array $extra): array => [
                    'name' => $extra['name'],
                    'price' => $extra['price'],
                    'currency' => $extra['currency'],
                    'quantity' => $extra['quantity'],
                ], $breakdown['onSiteExtras']),
                'optional_extras_not_included' => $this->optionalExtras($date, $passengers),
                'total' => $breakdown['tripTotal'],
                'source' => TripCatalog::PRICE_SOURCE,
                'last_updated' => $pricePerPerson['last_updated'],
                'may_be_outdated' => $pricePerPerson['may_be_outdated'],
                'binding_quote' => false,
                'guidance' => 'Say the total as an indicative catalog price for the group, not a confirmed one. Optional extras and travel or cancellation insurance can be added when booking.',
            ],
            trips: collect([$tour]),
        );
    }

    /**
     * The departure to price: required when the trip has scheduled ones, and
     * it must still take bookings.
     */
    private function departure(Tour $tour, ?int $departureId): ?TourDate
    {
        if ($departureId === null) {
            $departures = $this->catalog->bookableDepartures($tour);

            if ($departures->isEmpty()) {
                return null;
            }

            throw new SalesAssistantToolException(
                'departure_required',
                'This trip has scheduled departures: ask the customer which one and pass its departure_id.',
                ['departures' => $departures->take(6)->map(fn (TourDate $date): array => [
                    'departure_id' => $date->id,
                    ...$this->catalog->departureDates($date),
                ])->values()->all()],
            );
        }

        $date = $this->catalog->findDeparture($tour, $departureId);

        if (! TourDateStatus::isBookable($date->status)) {
            throw new SalesAssistantToolException(
                'departure_not_bookable',
                "This departure is {$date->status} in the catalog and cannot be booked. Offer another departure.",
            );
        }

        return $date;
    }

    /**
     * @return array<string, mixed> the calculator's breakdown
     */
    private function calculate(Tour $tour, ?TourDate $date, TourBookingSelection $selection): array
    {
        try {
            return $this->calculator->calculate($tour, $date, $selection);
        } catch (ValidationException $exception) {
            if (! array_key_exists('departurePlaceId', $exception->errors())) {
                // E.g. a mandatory extra with choices only the booking form offers.
                throw new SalesAssistantToolException(
                    'price_not_calculable',
                    'The total depends on choices made on the booking form. Give the per-person catalog price from get_trip_departures and point the customer to the booking page or the office for the exact total.',
                );
            }

            $places = $tour->departurePlaces()->where('active', true)->orderBy('name')->get();

            throw new SalesAssistantToolException(
                'pickup_location_required',
                'This trip needs a pickup location: ask the customer where they board and pass its pickup_location_id.',
                ['pickup_locations' => ($date?->offeredDeparturePlaces($places) ?? $places)
                    ->map(fn (TourDeparturePlace $place): array => [
                        'pickup_location_id' => $place->id,
                        'name' => (string) $place->name,
                        'fee_per_person' => $place->tourFee(),
                    ])
                    ->values()
                    ->all()],
            );
        }
    }

    /**
     * Extras the customer may add when booking, left out of the total.
     *
     * @return array<int, array{name: string, price: float, currency: string, price_unit: string}>
     */
    private function optionalExtras(?TourDate $date, int $passengers): array
    {
        if ($date === null) {
            return [];
        }

        return $date->extras()->get()
            ->filter(fn (TourDateExtra $extra): bool => TourExtraChargeRule::selectable($extra->charge_rule, $passengers))
            ->map(fn (TourDateExtra $extra): array => [
                'name' => (string) $extra->name,
                'price' => (float) $extra->price,
                'currency' => (string) $extra->currency,
                'price_unit' => (string) $extra->price_unit,
            ])
            ->values()
            ->all();
    }
}
