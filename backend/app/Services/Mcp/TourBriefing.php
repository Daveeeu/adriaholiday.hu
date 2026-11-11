<?php

namespace App\Services\Mcp;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Models\TourGalleryItem;
use App\Models\TourPriceItem;
use App\Models\TourProgramDay;
use App\Services\SalesAssistant\TripCatalog;
use App\Support\Booking\TourBookingStatus;
use App\Support\TourMeta;
use Illuminate\Support\Collection;

/**
 * Tours as the AI assistant reads them for the office: every tour, active or
 * not, with its upcoming departures, prices and, for staff who may see
 * bookings, how full each departure is.
 */
class TourBriefing
{
    private const MAX_PROGRAM_DAYS = 30;

    private const MAX_GALLERY_URLS = 12;

    public function __construct(
        private readonly TripCatalog $catalog,
        private readonly McpLinks $links,
    ) {}

    /**
     * The relations summary() reads.
     *
     * @return array<int|string, mixed>
     */
    public static function summaryRelations(): array
    {
        return TripCatalog::cardRelations();
    }

    /**
     * @return array<string, mixed>
     */
    public function summary(Tour $tour): array
    {
        $departures = $this->catalog->scheduledDepartures($tour);
        $next = $departures->first(fn (TourDate $date): bool => $this->catalog->availability($date)['bookable']) ?? $departures->first();

        return [
            'id' => $tour->id,
            'name' => (string) $tour->name,
            'slug' => (string) $tour->seo_name,
            'active' => (bool) $tour->active,
            'listed_on_site' => (bool) $tour->active && (bool) $tour->listed,
            'region' => $tour->region?->name,
            'destination' => TourMeta::country($tour),
            'travel_mode' => TourMeta::transport($tour),
            'duration' => TourMeta::duration($tour),
            'upcoming_departure_count' => $departures->count(),
            'next_departure' => $next !== null ? [...$this->catalog->departureDates($next), 'status' => $next->status] : null,
            'from_price_per_person' => $this->catalog->pricePerPerson($tour, $next),
            'public_url' => $tour->active ? $this->links->public($tour->publicPath()) : null,
            'admin_url' => $this->links->admin('tours'),
            'image_url' => $tour->mainImage()?->getUrl(),
        ];
    }

    /**
     * Everything about one tour. $occupancy holds the booked passengers per
     * departure (see occupancy()), or null when the reader may not see bookings.
     *
     * @param  array<int, array<string, int>>|null  $occupancy
     * @return array<string, mixed>
     */
    public function details(Tour $tour, ?array $occupancy): array
    {
        $priceItems = $tour->priceItems->where('active', true);

        return [
            ...$this->summary($tour),
            'subtitle' => $this->catalog->plainText($tour->subtitle, 200),
            'short_description' => $this->catalog->plainText($tour->short_description, 600),
            'description' => $this->catalog->plainText($tour->list_description, 1500),
            'accommodation' => TourMeta::accommodation($tour),
            'accommodation_info' => TourMeta::accommodationInfo($tour),
            'meals' => TourMeta::meals($tour),
            'meals_info' => TourMeta::mealsInfo($tour),
            'program_days' => $tour->programDays
                ->where('active', true)
                ->take(self::MAX_PROGRAM_DAYS)
                ->map(fn (TourProgramDay $day): array => [
                    'day' => $day->day_number,
                    'title' => $this->catalog->plainText($day->title, 160),
                    'description' => $this->catalog->plainText($day->description, 500),
                ])
                ->values()
                ->all(),
            'price_includes' => $this->priceItemTexts($priceItems->where('type', 'included')),
            'price_excludes' => $this->priceItemTexts($priceItems->where('type', 'excluded')),
            'notes' => $this->catalog->plainText($tour->notes, 800),
            'departure_places' => $tour->departurePlaces
                ->map(fn (TourDeparturePlace $place): array => [
                    'name' => $place->name,
                    'city' => $place->city,
                    'fee' => $place->pivot->fee !== null ? (float) $place->pivot->fee : ($place->fee !== null ? (float) $place->fee : null),
                ])
                ->values()
                ->all(),
            'departures' => $this->catalog->scheduledDepartures($tour)
                ->map(fn (TourDate $date): array => [
                    'id' => $date->id,
                    ...$this->catalog->departureDates($date),
                    'price_per_person' => $this->catalog->pricePerPerson($tour, $date),
                    'availability' => $this->catalog->availability($date),
                    'capacity' => $date->price_box_capacity,
                    'booked_passengers_by_status' => $occupancy !== null ? ($occupancy[$date->id] ?? []) : 'nincs jogosultság a foglalásokhoz',
                    'extras' => $date->extras
                        ->map(fn (TourDateExtra $extra): array => [
                            'name' => $extra->name,
                            'price' => $extra->price !== null ? (float) $extra->price : null,
                            'currency' => $extra->currency,
                            'unit' => $extra->price_unit,
                        ])
                        ->values()
                        ->all(),
                ])
                ->values()
                ->all(),
            'gallery_image_urls' => $this->galleryItems($tour)
                ->take(self::MAX_GALLERY_URLS)
                ->map(fn (TourGalleryItem $item): string => $item->media->getUrl())
                ->values()
                ->all(),
            'last_updated' => $tour->updated_at?->toDateString(),
        ];
    }

    /**
     * The relations details() reads.
     *
     * @return array<int|string, mixed>
     */
    public static function detailRelations(): array
    {
        return [
            ...self::summaryRelations(),
            'dates' => fn ($query) => $query->upcoming()->with('extras'),
            'programDays',
            'priceItems',
            'departurePlaces',
        ];
    }

    /**
     * Passengers of the tour's bookings per departure and booking status,
     * cancelled bookings left out: [tour_date_id => [status => passengers]].
     *
     * @return array<int, array<string, int>>
     */
    public function occupancy(Tour $tour): array
    {
        return Booking::query()
            ->where('booking_type', 'tour_booking')
            ->where('tour_id', $tour->id)
            ->where('cancelled', false)
            ->whereNotNull('tour_date_id')
            ->selectRaw('tour_date_id, status, SUM(passenger_count) as passengers')
            ->groupBy('tour_date_id', 'status')
            ->get()
            ->groupBy('tour_date_id')
            ->map(fn (Collection $rows): array => $rows
                ->mapWithKeys(fn (Booking $row): array => [TourBookingStatus::label((string) $row->status) => (int) $row->getAttribute('passengers')])
                ->all())
            ->all();
    }

    /**
     * The tour's active gallery images with their media, in order: the photos
     * the assistant may show.
     *
     * @return Collection<int, TourGalleryItem>
     */
    public function galleryItems(Tour $tour): Collection
    {
        return $tour->galleryItems
            ->where('active', true)
            ->filter(fn (TourGalleryItem $item): bool => $item->media !== null)
            ->sortBy('sort_order')
            ->values();
    }

    /**
     * @param  Collection<int, TourPriceItem>  $items
     * @return array<int, string>
     */
    private function priceItemTexts(Collection $items): array
    {
        return $items
            ->map(fn (TourPriceItem $item): ?string => $this->catalog->plainText($item->text, 200))
            ->filter()
            ->values()
            ->all();
    }
}
