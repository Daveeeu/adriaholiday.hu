<?php

namespace App\Http\Resources;

use App\Models\Apartment;
use App\Support\Apartment\ApartmentPriceTable;
use App\Support\Apartment\ApartmentServiceCatalog;
use App\Support\Booking\BookingInsuranceSettings;
use App\Support\RichTextSanitizer;
use App\Support\Seo\RobotsDirective;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An apartment's page on the public site: its details, gallery, the prices
 * still to come and what its booking form offers.
 *
 * @mixin Apartment
 */
class PortfolioApartmentDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $location = $this->location;
        $prices = ApartmentPriceTable::upcoming($this->pricing_matrix, today());

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'link' => $this->pagePath(),
            'name' => $this->name,
            'code' => $this->code,
            'stars' => (int) $this->stars,
            'address' => $this->address !== '' ? $this->address : null,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'distanceToCenterM' => $this->distance_to_center_m,
            'distanceToSeaM' => $this->distance_to_sea_m,
            'maxGuests' => $this->max_guests > 0 ? (int) $this->max_guests : null,
            'description' => $this->html($this->description),
            'apartmentTypeContent' => $this->html($this->apartment_type_content),
            'additionalInformation' => $this->html($this->additional_information),
            'allInclusiveDescription' => $this->html($this->all_inclusive_description),
            'services' => ApartmentServiceCatalog::describe($this->services),
            'gallery' => PortfolioApartmentGalleryItemResource::collection(
                $this->galleryItems->filter(fn ($item): bool => $item->active && $item->media !== null)->values(),
            )->resolve($request),
            'prices' => [
                'header' => $this->price_header,
                'innerHeader' => $this->price_inner_header,
                'currency' => 'EUR',
                'periods' => $prices['periods'],
                'rows' => $prices['rows'],
            ],
            'apartmentTypes' => ApartmentPriceTable::categories($this->pricing_matrix),
            'location' => $location === null ? null : [
                'slug' => $location->slug,
                'name' => $location->name,
                'areaSlug' => $location->area_slug,
                'areaName' => $location->area_name,
                'regionName' => $location->region?->name,
                'link' => $location->is_active && $location->area_slug ? $location->apartmentPagePath() : null,
                'apartmentInformation' => $this->html($location->apartment_information),
            ],
            'seoTitle' => $this->seo_title,
            'seoDescription' => $this->seo_description,
            'robots' => RobotsDirective::restrictive($this->seo_robots),
            'bookingInsurances' => BookingInsuranceSettings::load()->toArray(),
        ];
    }

    private function html(?string $value): ?string
    {
        return RichTextSanitizer::sanitize($value) ?: null;
    }
}
