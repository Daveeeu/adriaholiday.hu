<?php

namespace App\Services\SalesAssistant;

use App\Models\Tour;
use App\Models\TourDate;
use App\Support\PriceBoxData;
use App\Support\Tour\TourDateStatus;
use App\Support\TourMeta;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * The catalog as the assistant tools read it: finds the trips the public
 * site offers and describes them in the shape the model receives. Prices and
 * availability always carry their source and how fresh they are, since they
 * are catalog data the office maintains, not a live reservation system.
 */
class TripCatalog
{
    public const PRICE_SOURCE = 'catalog';

    /**
     * What the model is told about every price and seat count it receives.
     */
    public const CATALOG_NOTE = 'Prices and seats come from the Adria Holiday catalog, maintained by the office. They are not a live reservation: the office confirms availability and the final price when the booking is made.';

    /**
     * The relations the public offer card (PortfolioFeaturedTourResource) reads.
     *
     * @return array<int|string, mixed>
     */
    public static function cardRelations(): array
    {
        return [
            'region',
            'dates' => fn ($query) => $query->upcoming(),
            'media',
            'galleryItems.media',
        ];
    }

    /**
     * An active trip by its public slug, as its page on the site shows it.
     *
     * @param  array<int|string, mixed>  $relations
     *
     * @throws SalesAssistantToolException when no active trip has the slug
     */
    public function findTrip(string $slug, array $relations = []): Tour
    {
        $tour = Tour::query()
            ->where('active', true)
            ->where('seo_name', $slug)
            ->with([...self::cardRelations(), ...$relations])
            ->first();

        return $tour ?? throw SalesAssistantToolException::tripNotFound($slug);
    }

    /**
     * Active trips by id, ready for the public offer card, in the given order
     * (ids no longer offered are left out).
     *
     * @param  array<int, int>  $ids
     * @return Collection<int, Tour>
     */
    public function cardsByIds(array $ids): Collection
    {
        if ($ids === []) {
            return new Collection;
        }

        $tours = Tour::query()->where('active', true)->whereIn('id', $ids)->with(self::cardRelations())->get()->keyBy('id');

        return collect($ids)->map(fn (int $id): ?Tour => $tours->get($id))->filter()->values();
    }

    /**
     * An upcoming, scheduled departure of the trip.
     *
     * @throws SalesAssistantToolException when the trip has no such departure
     */
    public function findDeparture(Tour $tour, int $departureId): TourDate
    {
        $date = $this->scheduledDepartures($tour)->firstWhere('id', $departureId);

        return $date ?? throw SalesAssistantToolException::departureNotFound();
    }

    /**
     * The trip's upcoming departures that have a date, earliest first
     * (expects `dates` loaded with the upcoming scope, see cardRelations()).
     *
     * @return Collection<int, TourDate>
     */
    public function scheduledDepartures(Tour $tour): Collection
    {
        return $tour->dates
            ->filter(fn (TourDate $date): bool => $date->start_date !== null)
            ->sortBy('start_date')
            ->values();
    }

    /**
     * @return Collection<int, TourDate>
     */
    public function bookableDepartures(Tour $tour): Collection
    {
        return $this->scheduledDepartures($tour)
            ->filter(fn (TourDate $date): bool => TourDateStatus::isBookable($date->status))
            ->values();
    }

    /**
     * The per-person price the site shows for a departure (or the trip), with
     * the same precedence the booking uses: the departure's price, else the
     * trip's. Null when the catalog has no price.
     *
     * @return array{amount: float, currency: string, label: string|null, original_amount: float|null, discount_badge: string|null, source: string, last_updated: string|null, may_be_outdated: bool}|null
     */
    public function pricePerPerson(Tour $tour, ?TourDate $date = null): ?array
    {
        $priceBox = $date !== null ? PriceBoxData::fromDate($date) : null;
        $priceSource = $date;

        if (($priceBox['price'] ?? null) === null) {
            $priceBox = PriceBoxData::fromTour($tour);
            $priceSource = $tour;
        }

        if (($priceBox['price'] ?? null) === null) {
            return null;
        }

        return [
            'amount' => (float) $priceBox['price'],
            'currency' => $tour->price_box_currency ?: 'HUF',
            'label' => $priceBox['displayedPrice'] ?? null,
            'original_amount' => $priceBox['originalPrice'] ?? null,
            'discount_badge' => ($date !== null ? $date->price_box_discount_badge : null) ?: $tour->price_box_discount_badge,
            'source' => self::PRICE_SOURCE,
            ...$this->freshness($priceSource->updated_at),
        ];
    }

    /**
     * Whether a departure takes bookings and the seats the catalog lists.
     *
     * @return array{status: string, bookable: bool, seats_left: int|null, confirmed: false, source: string, last_updated: string|null, may_be_outdated: bool}
     */
    public function availability(TourDate $date): array
    {
        return [
            'status' => (string) ($date->status ?: 'unknown'),
            'bookable' => TourDateStatus::isBookable($date->status),
            'seats_left' => $date->price_box_available_seats,
            'confirmed' => false,
            'source' => self::PRICE_SOURCE,
            ...$this->freshness($date->updated_at),
        ];
    }

    /**
     * The essentials of a trip the model needs to present it.
     *
     * @param  Collection<int, TourDate>|null  $departures  the departures to describe; default: the bookable ones
     * @return array<string, mixed>
     */
    public function summary(Tour $tour, ?Collection $departures = null): array
    {
        $departures ??= $this->bookableDepartures($tour);
        $next = $departures->first();

        return [
            'slug' => (string) $tour->seo_name,
            'name' => (string) $tour->name,
            'destination' => TourMeta::country($tour),
            'travel_mode' => TourMeta::transport($tour),
            'duration' => TourMeta::duration($tour),
            'next_departure' => $next !== null ? $this->departureDates($next) : null,
            'matching_departure_count' => $departures->count(),
            'from_price_per_person' => $this->pricePerPerson($tour, $next),
            'summary' => $this->plainText($tour->short_description ?: $tour->list_description, 280),
        ];
    }

    /**
     * @return array{start_date: string|null, end_date: string|null, days: int|null}
     */
    public function departureDates(TourDate $date): array
    {
        return [
            'start_date' => $date->start_date?->toDateString(),
            'end_date' => $date->end_date?->toDateString(),
            'days' => $date->start_date !== null && $date->end_date !== null
                ? (int) $date->start_date->diffInDays($date->end_date) + 1
                : null,
        ];
    }

    /**
     * Catalog text as plain words: rich text without its markup, shortened.
     */
    public function plainText(?string $value, int $limit): ?string
    {
        $text = html_entity_decode(strip_tags((string) preg_replace('#<br\s*/?>|</(p|li|h\d)>#i', ' ', (string) $value)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = trim((string) preg_replace('/\s+/u', ' ', $text));

        return $text !== '' ? Str::limit($text, $limit) : null;
    }

    /**
     * @return array{last_updated: string|null, may_be_outdated: bool}
     */
    private function freshness(?CarbonInterface $updatedAt): array
    {
        $staleAfterDays = (int) config('sales_assistant.stale_after_days');

        return [
            'last_updated' => $updatedAt?->toDateString(),
            'may_be_outdated' => $updatedAt === null || $updatedAt->lt(now()->subDays($staleAfterDays)),
        ];
    }
}
