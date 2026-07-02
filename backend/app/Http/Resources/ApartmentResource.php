<?php

namespace App\Http\Resources;

use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'regionId' => $this->region_id,
            'locationId' => $this->location_id,
            'galleryId' => $this->gallery_id,
            'type' => $this->type,
            'name' => $this->name,
            'slug' => $this->slug,
            'code' => $this->code,
            'seoName' => $this->seo_name,
            'seoAutoGenerate' => (bool) $this->seo_auto_generate,
            'isActive' => (bool) $this->is_active,
            'featured' => (bool) $this->featured,
            'isAccommodation' => (bool) $this->is_accommodation,
            'stars' => (int) $this->stars,
            'bedrooms' => (int) $this->bedrooms,
            'bathrooms' => (int) $this->bathrooms,
            'maxGuests' => (int) $this->max_guests,
            'sizeM2' => (float) $this->size_m2,
            'address' => $this->address,
            'mapAddress' => $this->map_address,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'coordinates' => $this->coordinates,
            'shortDescription' => RichTextSanitizer::sanitize($this->short_description),
            'description' => RichTextSanitizer::sanitize($this->description),
            'additionalInformation' => RichTextSanitizer::sanitize($this->additional_information),
            'apartmentTypeContent' => RichTextSanitizer::sanitize($this->apartment_type_content),
            'typeDescription' => RichTextSanitizer::sanitize($this->apartment_type_content),
            'apartment_type_content' => RichTextSanitizer::sanitize($this->apartment_type_content),
            'apartmentTypeDescription' => RichTextSanitizer::sanitize($this->apartment_type_description),
            'apartmentTypeTextDescription' => RichTextSanitizer::sanitize($this->apartment_type_text_description),
            'apartmentTypeTextDescription2' => RichTextSanitizer::sanitize($this->apartment_type_text_description_2),
            'allInclusiveDescription' => RichTextSanitizer::sanitize($this->all_inclusive_description),
            'allInclusiveContent' => RichTextSanitizer::sanitize($this->all_inclusive_description),
            'all_inclusive_content' => RichTextSanitizer::sanitize($this->all_inclusive_description),
            'priceHeader' => $this->price_header,
            'priceInnerHeader' => $this->price_inner_header,
            'pricingMatrix' => $this->pricing_matrix,
            'priceSeasons' => $this->price_seasons ?? [],
            'amenities' => $this->amenities ?? [],
            'services' => $this->services ?? [],
            'status' => $this->status,
            'sortOrder' => (int) $this->sort_order,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
