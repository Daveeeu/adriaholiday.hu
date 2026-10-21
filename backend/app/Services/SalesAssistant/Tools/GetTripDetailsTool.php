<?php

namespace App\Services\SalesAssistant\Tools;

use App\Models\TourPriceItem;
use App\Models\TourProgramDay;
use App\Services\SalesAssistant\TripCatalog;
use App\Support\TourMeta;
use Illuminate\Support\Collection;

/**
 * What a trip offers: program, stay, meals and what the price includes.
 */
class GetTripDetailsTool implements SalesAssistantTool
{
    private const MAX_LIST_ITEMS = 12;

    public function __construct(private readonly TripCatalog $catalog) {}

    public function name(): string
    {
        return 'get_trip_details';
    }

    public function description(): string
    {
        return 'Get the details of one trip: day-by-day program, accommodation, meals, travel mode, and what the price includes and excludes. Use it when the customer asks what a trip is like.';
    }

    public function parameters(): array
    {
        return TripArguments::object(['slug' => TripArguments::slugSchema()], ['slug']);
    }

    public function rules(): array
    {
        return ['slug' => TripArguments::slugRules()];
    }

    public function handle(array $arguments): SalesAssistantToolResult
    {
        $tour = $this->catalog->findTrip($arguments['slug'], ['programDays', 'priceItems']);
        $priceItems = $tour->priceItems->where('active', true);

        return new SalesAssistantToolResult(
            result: [
                ...$this->catalog->summary($tour),
                'subtitle' => $this->catalog->plainText($tour->subtitle, 160),
                'description' => $this->catalog->plainText($tour->list_description ?: $tour->short_description, 600),
                'accommodation' => TourMeta::accommodation($tour),
                'accommodation_info' => TourMeta::accommodationInfo($tour),
                'meals' => TourMeta::meals($tour),
                'meals_info' => TourMeta::mealsInfo($tour),
                'program' => $tour->programDays
                    ->where('active', true)
                    ->take(self::MAX_LIST_ITEMS)
                    ->map(fn (TourProgramDay $day): string => trim(($day->day_number ? "{$day->day_number}. nap: " : '').$this->catalog->plainText($day->title, 120)))
                    ->values()
                    ->all(),
                'price_includes' => $this->priceItemTexts($priceItems->where('type', 'included')),
                'price_excludes' => $this->priceItemTexts($priceItems->where('type', 'excluded')),
                'last_updated' => $tour->updated_at?->toDateString(),
            ],
            trips: collect([$tour]),
        );
    }

    /**
     * @param  Collection<int, TourPriceItem>  $items
     * @return array<int, string>
     */
    private function priceItemTexts(Collection $items): array
    {
        return $items
            ->take(self::MAX_LIST_ITEMS)
            ->map(fn (TourPriceItem $item): ?string => $this->catalog->plainText($item->text, 160))
            ->filter()
            ->values()
            ->all();
    }
}
