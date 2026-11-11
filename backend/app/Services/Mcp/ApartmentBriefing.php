<?php

namespace App\Services\Mcp;

use App\Models\Apartment;
use App\Models\ApartmentGalleryItem;
use App\Services\SalesAssistant\TripCatalog;
use App\Support\Apartment\ApartmentPriceTable;
use App\Support\Apartment\ApartmentServiceCatalog;
use Illuminate\Support\Collection;

/**
 * Apartments as the AI assistant reads them: where they are, what they
 * offer and their upcoming nightly prices.
 */
class ApartmentBriefing
{
    private const MAX_GALLERY_URLS = 12;

    public function __construct(
        private readonly TripCatalog $catalog,
        private readonly McpLinks $links,
    ) {}

    /**
     * @return array<int|string, mixed>
     */
    public static function relations(): array
    {
        return ['region', 'location', 'galleryItems' => fn ($items) => $items->where('active', true)->with('media')];
    }

    /**
     * @return array<string, mixed>
     */
    public function summary(Apartment $apartment): array
    {
        return [
            'id' => $apartment->id,
            'name' => $apartment->name,
            'code' => $apartment->code,
            'active' => (bool) $apartment->is_active,
            'status' => $apartment->status,
            'region' => $apartment->region?->name,
            'location' => $apartment->location?->name,
            'stars' => $apartment->stars,
            'max_guests' => $apartment->max_guests ?? ApartmentPriceTable::maxGuests($apartment->pricing_matrix),
            'distance_to_sea_m' => $apartment->distance_to_sea_m,
            'lowest_upcoming_price_per_night_eur' => ApartmentPriceTable::lowestUpcomingPrice($apartment->pricing_matrix, today()),
            'public_url' => $apartment->is_active && $apartment->status === Apartment::STATUS_PUBLISHED ? $this->links->public($apartment->pagePath()) : null,
            'admin_url' => $this->links->admin('apartments'),
            'image_url' => $this->galleryItems($apartment)->first()?->media->getUrl(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function details(Apartment $apartment): array
    {
        return [
            ...$this->summary($apartment),
            'type' => $apartment->type,
            'bedrooms' => $apartment->bedrooms,
            'bathrooms' => $apartment->bathrooms,
            'size_m2' => $apartment->size_m2 !== null ? (float) $apartment->size_m2 : null,
            'distance_to_center_m' => $apartment->distance_to_center_m,
            'address' => $apartment->address,
            'short_description' => $this->catalog->plainText($apartment->short_description, 600),
            'description' => $this->catalog->plainText($apartment->description, 1500),
            'additional_information' => $this->catalog->plainText($apartment->additional_information, 800),
            'services' => collect($apartment->services ?? [])
                ->map(fn (mixed $key): ?string => is_string($key) ? ApartmentServiceCatalog::label($key) ?? $key : null)
                ->filter()
                ->values()
                ->all(),
            'amenities' => $apartment->amenities ?? [],
            'prices_are' => 'EUR, apartmanonként és éjszakánként (ahogy a weboldal mutatja)',
            'upcoming_prices_per_night' => ApartmentPriceTable::upcoming($apartment->pricing_matrix, today()),
            'gallery_image_urls' => $this->galleryItems($apartment)
                ->take(self::MAX_GALLERY_URLS)
                ->map(fn (ApartmentGalleryItem $item): string => $item->media->getUrl())
                ->values()
                ->all(),
            'last_updated' => $apartment->updated_at?->toDateString(),
        ];
    }

    /**
     * @return Collection<int, ApartmentGalleryItem>
     */
    public function galleryItems(Apartment $apartment): Collection
    {
        return $apartment->galleryItems
            ->filter(fn (ApartmentGalleryItem $item): bool => $item->active && $item->media !== null)
            ->values();
    }
}
