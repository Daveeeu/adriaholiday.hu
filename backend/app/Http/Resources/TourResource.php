<?php

namespace App\Http\Resources;

use App\Support\PriceBoxData;
use App\Support\RichTextSanitizer;
use App\Support\Tour\TourRouteStops;
use App\Support\TourLabelResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class TourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $priceBox = PriceBoxData::fromTour($this->resource);

        return [
            'id' => $this->id,
            'sortOrder' => (int) $this->sort_order,
            'active' => (bool) $this->active,
            'featured' => (bool) $this->featured,
            'featuredOrder' => $this->featured_order,
            'recommended' => (bool) $this->recommended,
            'listed' => $this->listed ?? true,
            'xmlEnabled' => (bool) $this->xml_enabled,
            'couponable' => (bool) $this->couponable,
            'name' => $this->name,
            'subtitle' => $this->subtitle,
            'seoName' => $this->seo_name,
            'seoAutoGenerate' => (bool) $this->seo_auto_generate,
            'seoTitle' => $this->seo_title,
            'seoDescription' => $this->seo_description,
            'seoRobots' => $this->seo_robots,
            'listDescription' => RichTextSanitizer::sanitize($this->list_description),
            'shortDescription' => RichTextSanitizer::sanitize($this->short_description),
            'programBefore' => RichTextSanitizer::sanitize($this->program_before),
            'program' => RichTextSanitizer::sanitize($this->program),
            'programFooter' => RichTextSanitizer::sanitize($this->program_footer),
            'routeStops' => TourRouteStops::normalize($this->route_stops),
            'teaser' => RichTextSanitizer::sanitize($this->teaser),
            'tickets' => RichTextSanitizer::sanitize($this->tickets),
            'optionalPrograms' => RichTextSanitizer::sanitize($this->optional_programs),
            'inclusions' => RichTextSanitizer::sanitize($this->inclusions),
            'paymentProgram' => RichTextSanitizer::sanitize($this->payment_program),
            'prices' => RichTextSanitizer::sanitize($this->prices),
            'discounts' => RichTextSanitizer::sanitize($this->discounts),
            'notes' => RichTextSanitizer::sanitize($this->notes),
            'programDays' => TourProgramDayResource::collection($this->programDays ?? [])->resolve($request),
            'priceItems' => TourPriceItemResource::collection($this->priceItems ?? [])->resolve($request),
            'priceBox' => $priceBox,
            'regionId' => $this->region_id,
            'regionLabel' => TourLabelResolver::regionLabel($this->region ?? null, $this->region_id),
            'programTypeId' => $this->program_type_id,
            'programTypeLabel' => TourLabelResolver::referenceOptionLabel('program-type', $this->program_type_id),
            'travelModeId' => $this->travel_mode_id,
            'catering' => $this->catering,
            'cateringInfo' => $this->catering_info,
            'accommodation' => $this->accommodation,
            'accommodationInfo' => $this->accommodation_info,
            'travelModeLabel' => TourLabelResolver::referenceOptionLabel('travel-mode', $this->travel_mode_id),
            'bookingFormTemplateId' => $this->booking_form_template_id,
            'bookingFormTemplate' => $this->whenLoaded('bookingFormTemplate', fn () => $this->bookingFormTemplate ? new BookingFormTemplateResource($this->bookingFormTemplate) : null),
            'countryIds' => $this->country_ids ?? [],
            'countries' => TourLabelResolver::referenceOptionItems('country', $this->country_ids ?? []),
            'tagIds' => $this->tag_ids ?? [],
            'tags' => TourLabelResolver::blogTagItems($this->tag_ids ?? []),
            'searchKeywords' => $this->search_keywords ?? [],
            'categoryIds' => $this->category_ids ?? [],
            'categories' => TourLabelResolver::blogCategoryItems($this->category_ids ?? []),
            'lastBookingAt' => $this->whenHas('last_booking_at', fn ($value) => $value ? Carbon::parse($value)->toISOString() : null),
            'bookingsCount' => $this->whenHas('bookings_count', fn ($value) => (int) $value),
            'nextDepartureDate' => $this->whenHas('next_departure_date', fn ($value) => $value ? Carbon::parse($value)->toDateString() : null),
            'price' => $priceBox['price'] ?? ($this->price !== null ? (float) $this->price : null),
            'displayedPrice' => $priceBox['displayedPrice'] ?? null,
            'sliderText' => $this->slider_text,
            'sliderImageMedia' => $this->getFirstMedia('slider') ? new MediaResource($this->getFirstMedia('slider')) : null,
            'programPdfMedia' => $this->getFirstMedia('pdf') ? new MediaResource($this->getFirstMedia('pdf')) : null,
            'departurePlaces' => $this->whenLoaded('departurePlaces', fn () => TourDeparturePlaceResource::collection($this->departurePlaces)->resolve(), []),
            'departurePlaceIds' => $this->whenLoaded('departurePlaces', fn () => $this->departurePlaces->pluck('id')->values()->all(), []),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
