<?php

namespace App\Services\SalesAssistant\Tools;

use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Services\SalesAssistant\TripCatalog;
use Illuminate\Support\Collection;

/**
 * Where a trip's bus picks passengers up, and what each pickup costs.
 */
class GetPickupLocationsTool implements SalesAssistantTool
{
    public function __construct(private readonly TripCatalog $catalog) {}

    public function name(): string
    {
        return 'get_pickup_locations';
    }

    public function description(): string
    {
        return 'List the pickup (boarding) locations of one trip with the extra fee per person for each. Pass departure_id to get only the locations that departure offers.';
    }

    public function parameters(): array
    {
        return TripArguments::object([
            'slug' => TripArguments::slugSchema(),
            'departure_id' => TripArguments::departureIdSchema('Optional departure_id from get_trip_departures.'),
        ], ['slug']);
    }

    public function rules(): array
    {
        return [
            'slug' => TripArguments::slugRules(),
            'departure_id' => TripArguments::optionalIdRules(),
        ];
    }

    public function handle(array $arguments): SalesAssistantToolResult
    {
        $tour = $this->catalog->findTrip($arguments['slug']);
        $places = $this->places($tour, $arguments['departure_id'] ?? null);

        return new SalesAssistantToolResult(
            result: [
                'trip' => ['slug' => (string) $tour->seo_name, 'name' => (string) $tour->name],
                'pickup_required' => $places->isNotEmpty(),
                'pickup_locations' => $places
                    ->map(fn (TourDeparturePlace $place): array => [
                        'pickup_location_id' => $place->id,
                        'name' => (string) $place->name,
                        'city' => $place->city,
                        'fee_per_person' => ['amount' => $place->tourFee(), 'currency' => 'HUF'],
                    ])
                    ->all(),
                'guidance' => $places->isEmpty()
                    ? 'The catalog lists no pickup location for this trip. Say that the office gives the departure details.'
                    : 'The customer picks one location when booking.',
            ],
            trips: collect([$tour]),
        );
    }

    /**
     * @return Collection<int, TourDeparturePlace>
     */
    private function places(Tour $tour, ?int $departureId): Collection
    {
        $places = $tour->departurePlaces()->where('active', true)->orderBy('name')->get();

        if ($departureId === null) {
            return $places;
        }

        return $this->catalog->findDeparture($tour, $departureId)->offeredDeparturePlaces($places);
    }
}
