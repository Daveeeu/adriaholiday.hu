<?php

namespace App\Services\SalesAssistant\Tools;

use App\Models\Tour;
use App\Models\TourDate;
use App\Services\SalesAssistant\SalesAssistantToolException;
use App\Services\SalesAssistant\TripCatalog;
use App\Support\PortfolioOfferQuery;
use App\Support\Tour\TourDateStatus;
use App\Support\TripDurationRange;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;

/**
 * Searches the trips the site lists, through the same query as the public
 * offer search, and returns the best few matches.
 */
class SearchTripsTool implements SalesAssistantTool
{
    public const TRAVEL_MODES = ['bus', 'plane', 'train'];

    public function __construct(private readonly TripCatalog $catalog) {}

    public function name(): string
    {
        return 'search_trips';
    }

    public function description(): string
    {
        return 'Search the Adria Holiday trip catalog. Returns at most '.$this->limit().' matching trips with their next matching departure and from-price per person, plus the total number of matches. Call it whenever the customer describes what they want; never recommend a trip that no search returned.';
    }

    public function parameters(): array
    {
        return TripArguments::object([
            'query' => [
                'type' => 'string',
                'description' => 'Destination or kind of trip in Hungarian, e.g. "Horvátország", "Toszkána", "Párizs", "adventi vásár", "tengerparti üdülés". Omit to search by the other filters only.',
            ],
            'departure_from' => TripArguments::dateSchema('Earliest departure date the customer accepts.'),
            'departure_until' => TripArguments::dateSchema('Latest departure date the customer accepts.'),
            'max_price_per_person' => [
                'type' => 'integer',
                'minimum' => 1,
                'description' => 'Budget per person in Hungarian forints (HUF).',
            ],
            'travel_mode' => [
                'type' => 'string',
                'enum' => self::TRAVEL_MODES,
                'description' => 'bus: autóbuszos, plane: repülős, train: vonatos.',
            ],
            'trip_length' => [
                'type' => 'string',
                'enum' => array_column(TripDurationRange::cases(), 'value'),
                'description' => 'short: 1-4 days, medium: 5-8 days, long: 9 or more days.',
            ],
            'departure_city' => [
                'type' => 'string',
                'description' => 'Hungarian city where the customer wants to board the bus, e.g. "Győr".',
            ],
        ]);
    }

    public function rules(): array
    {
        return [
            'query' => ['nullable', 'string', 'max:100'],
            'departure_from' => TripArguments::optionalDateRules(),
            'departure_until' => TripArguments::optionalDateRules(),
            'max_price_per_person' => ['nullable', 'integer', 'min:1', 'max:100000000'],
            'travel_mode' => ['nullable', Rule::in(self::TRAVEL_MODES)],
            'trip_length' => ['nullable', Rule::enum(TripDurationRange::class)],
            'departure_city' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function handle(array $arguments): SalesAssistantToolResult
    {
        $from = $arguments['departure_from'] ?? null;
        $until = $arguments['departure_until'] ?? null;

        if ($from !== null && $until !== null && $until < $from) {
            throw new SalesAssistantToolException(
                'invalid_date_range',
                'departure_until is before departure_from. Ask the customer to clarify the dates.',
            );
        }

        $query = PortfolioOfferQuery::buildBaseQuery(Request::create('/', 'GET', array_filter([
            'search' => $arguments['query'] ?? null,
            'from' => $from,
            'until' => $until,
            'maxPrice' => $arguments['max_price_per_person'] ?? null,
            'transport' => $arguments['travel_mode'] ?? null,
            'duration' => $arguments['trip_length'] ?? null,
            'departure' => $arguments['departure_city'] ?? null,
        ], fn (mixed $value): bool => $value !== null && $value !== '')));

        $total = (clone $query)->count();
        $trips = $this->bookableFirst($query)->limit($this->limit())->get();
        $duration = TripDurationRange::tryFrom((string) ($arguments['trip_length'] ?? ''));

        return new SalesAssistantToolResult(
            result: [
                'total_matches' => $total,
                'returned' => $trips->count(),
                'trips' => $trips
                    ->map(fn (Tour $tour): array => $this->catalog->summary($tour, $this->matchingDepartures($tour, $from, $until, $duration)))
                    ->all(),
                'guidance' => $this->guidance($total, $trips->count()).' A trip whose next_departure is null has no scheduled date (on request): say so.',
                'catalog_note' => TripCatalog::CATALOG_NOTE,
            ],
            trips: $trips,
            replacesRecommendations: true,
        );
    }

    /**
     * The trip's bookable departures within the requested window and length,
     * so the summary names a departure that actually fits the request.
     *
     * @return Collection<int, TourDate>
     */
    private function matchingDepartures(Tour $tour, ?string $from, ?string $until, ?TripDurationRange $duration): Collection
    {
        return $this->catalog->bookableDepartures($tour)
            ->filter(function (TourDate $date) use ($from, $until, $duration): bool {
                $start = $date->start_date->toDateString();
                $days = $this->catalog->departureDates($date)['days'];

                return ($from === null || $start >= $from)
                    && ($until === null || $start <= $until)
                    && ($duration === null || ($days !== null && $duration->contains($days)));
            })
            ->values();
    }

    /**
     * Trips the customer can book come before those only offered on request,
     * otherwise in the site's own order.
     *
     * @param  Builder<Tour>  $query
     * @return Builder<Tour>
     */
    private function bookableFirst(Builder $query): Builder
    {
        return $query
            ->withExists(['dates as has_bookable_departure' => fn (Builder $dates) => $dates
                ->upcoming()
                ->whereNotNull('start_date')
                ->whereNotIn('status', TourDateStatus::unbookable())])
            ->reorder()
            ->orderByDesc('has_bookable_departure')
            ->orderBy('sort_order')
            ->orderByDesc('created_at');
    }

    private function guidance(int $total, int $returned): string
    {
        if ($total === 0) {
            return 'No trip matches. Tell the customer honestly and suggest relaxing one filter (dates, budget, travel mode or destination), then search again.';
        }

        if ($total > $returned) {
            return "Only the first {$returned} of {$total} matches are returned. Present them and ask a question that narrows the search.";
        }

        return 'Present these trips briefly and ask which one interests the customer.';
    }

    private function limit(): int
    {
        return (int) config('sales_assistant.max_search_results');
    }
}
