<?php

namespace App\Services\SalesAssistant\Tools;

use App\Models\TourDate;
use App\Services\SalesAssistant\TripCatalog;

/**
 * The upcoming departures of a trip with their catalog availability and price.
 */
class GetTripDeparturesTool implements SalesAssistantTool
{
    private const DEFAULT_LIMIT = 6;

    private const MAX_LIMIT = 10;

    public function __construct(private readonly TripCatalog $catalog) {}

    public function name(): string
    {
        return 'get_trip_departures';
    }

    public function description(): string
    {
        return 'List the upcoming departures of one trip: dates, catalog availability (bookable, seats left when known) and price per person. Use it for questions about when a trip goes and whether there is room. Availability is catalog data, not a confirmed reservation.';
    }

    public function parameters(): array
    {
        return TripArguments::object([
            'slug' => TripArguments::slugSchema(),
            'departure_from' => TripArguments::dateSchema('Only list departures on or after this date.'),
            'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => self::MAX_LIMIT, 'description' => 'How many departures to list (default '.self::DEFAULT_LIMIT.').'],
        ], ['slug']);
    }

    public function rules(): array
    {
        return [
            'slug' => TripArguments::slugRules(),
            'departure_from' => TripArguments::optionalDateRules(),
            'limit' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_LIMIT],
        ];
    }

    public function handle(array $arguments): SalesAssistantToolResult
    {
        $tour = $this->catalog->findTrip($arguments['slug']);
        $from = $arguments['departure_from'] ?? null;
        $departures = $this->catalog->scheduledDepartures($tour)
            ->filter(fn (TourDate $date): bool => $from === null || $date->start_date->toDateString() >= $from)
            ->values();
        $listed = $departures->take($arguments['limit'] ?? self::DEFAULT_LIMIT);

        return new SalesAssistantToolResult(
            result: [
                'trip' => ['slug' => (string) $tour->seo_name, 'name' => (string) $tour->name],
                'total_upcoming' => $departures->count(),
                'departures' => $listed
                    ->map(fn (TourDate $date): array => [
                        'departure_id' => $date->id,
                        ...$this->catalog->departureDates($date),
                        'availability' => $this->catalog->availability($date),
                        'price_per_person' => $this->catalog->pricePerPerson($tour, $date),
                    ])
                    ->all(),
                'guidance' => $departures->isEmpty()
                    ? 'The catalog lists no upcoming departure for this trip (it is on request). Say so and suggest asking the office about dates.'
                    : 'Seats and prices are catalog data: never promise a seat. Use get_trip_price for the price of the customer\'s group.',
                'catalog_note' => TripCatalog::CATALOG_NOTE,
            ],
            trips: collect([$tour]),
        );
    }
}
