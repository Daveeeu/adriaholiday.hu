<?php

namespace App\Http\Resources;

use App\Models\Apartment;
use App\Support\Apartment\ApartmentPriceTable;
use App\Support\Apartment\ApartmentServiceCatalog;
use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An apartment in a location's list on the public site.
 *
 * @mixin Apartment
 */
class PortfolioApartmentCardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $cover = $this->galleryItems->first(fn ($item): bool => $item->active && $item->media !== null);

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'link' => $this->pagePath(),
            'name' => $this->name,
            'code' => $this->code,
            'stars' => (int) $this->stars,
            'address' => $this->address !== '' ? $this->address : null,
            'shortDescription' => RichTextSanitizer::sanitize($this->short_description) ?: null,
            'distanceToCenterM' => $this->distance_to_center_m,
            'distanceToSeaM' => $this->distance_to_sea_m,
            'maxGuests' => $this->max_guests > 0 ? (int) $this->max_guests : null,
            'apartmentTypes' => ApartmentPriceTable::categories($this->pricing_matrix),
            'lowestPrice' => ApartmentPriceTable::lowestUpcomingPrice($this->pricing_matrix, today()),
            'currency' => 'EUR',
            'services' => ApartmentServiceCatalog::describe($this->services),
            'image' => $cover !== null ? new MediaResource($cover->media) : null,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
        ];
    }
}
