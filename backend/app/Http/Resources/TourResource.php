<?php

namespace App\Http\Resources;

use App\Support\TourLabelResolver;
use App\Http\Resources\BookingFormTemplateResource;
use App\Support\PriceBoxData;
use App\Support\RichTextSanitizer;
use App\Models\HomepageOffer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourResource extends JsonResource
{
    private function homepageOfferSummary(): ?array
    {
        /** @var HomepageOffer|null $homepageOffer */
        $homepageOffer = $this->homepageOffer;

        if (! $homepageOffer) {
            return null;
        }

        $translation = $homepageOffer->translations->firstWhere('locale', 'hu')
            ?? $homepageOffer->translations->first();

        return [
            'id' => $homepageOffer->id,
            'title' => $translation?->name ?? $homepageOffer->image_title,
            'slug' => $translation?->seo_name,
        ];
    }

    private function homepageOfferLabel(): ?string
    {
        /** @var HomepageOffer|null $homepageOffer */
        $homepageOffer = $this->homepageOffer;

        if (! $homepageOffer) {
            return null;
        }

        $translation = $homepageOffer->translations->firstWhere('locale', 'hu')
            ?? $homepageOffer->translations->first();

        return $translation?->name;
    }

    public function toArray(Request $request): array
    {
        $priceBox = PriceBoxData::fromTour($this->resource);

        return [
            'id' => $this->id,
            'sortOrder' => (int) $this->sort_order,
            'active' => (bool) $this->active,
            'featured' => (bool) $this->featured,
            'recommended' => (bool) $this->recommended,
            'partnerOffer' => (bool) $this->partner_offer,
            'imageOffer' => (bool) $this->image_offer,
            'xmlEnabled' => (bool) $this->xml_enabled,
            'sliderImageEnabled' => (bool) $this->slider_image_enabled,
            'sliderTextEnabled' => (bool) $this->slider_text_enabled,
            'name' => $this->name,
            'seoName' => $this->seo_name,
            'seoAutoGenerate' => (bool) $this->seo_auto_generate,
            'action1' => $this->action1,
            'action2' => $this->action2,
            'listDescription' => RichTextSanitizer::sanitize($this->list_description),
            'shortDescription' => RichTextSanitizer::sanitize($this->short_description),
            'programPdfPath' => $this->program_pdf_path,
            'programPdf' => $this->program_pdf_path,
            'programPdfFile' => $this->program_pdf_file,
            'sliderImage' => $this->slider_image,
            'programBefore' => RichTextSanitizer::sanitize($this->program_before),
            'program' => RichTextSanitizer::sanitize($this->program),
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
            'homepageOfferId' => $this->homepage_offer_id,
            'homepageOfferIds' => $this->homepage_offer_id ? [$this->homepage_offer_id] : [],
            'homepageOfferLabel' => $this->relationLoaded('homepageOffer') ? $this->homepageOfferLabel() : null,
            'homepageOffers' => $this->relationLoaded('homepageOffer')
                ? array_values(array_filter([$this->homepageOfferSummary()]))
                : [],
            'groupId' => $this->group_id,
            'groupLabel' => TourLabelResolver::regionGroupLabel($this->group_id),
            'seasonalGroupId' => $this->seasonal_group_id,
            'seasonalGroupLabel' => TourLabelResolver::seasonalGroupLabel($this->seasonal_group_id),
            'fitId' => $this->fit_id,
            'fitLabel' => TourLabelResolver::referenceOptionLabel('fit', $this->fit_id),
            'programTypeId' => $this->program_type_id,
            'programTypeLabel' => TourLabelResolver::referenceOptionLabel('program-type', $this->program_type_id),
            'travelModeId' => $this->travel_mode_id,
            'travelModeLabel' => TourLabelResolver::referenceOptionLabel('travel-mode', $this->travel_mode_id),
            'difficultyId' => $this->difficulty_id,
            'difficultyLabel' => TourLabelResolver::referenceOptionLabel('difficulty', $this->difficulty_id),
            'bookingFormTemplateId' => $this->booking_form_template_id,
            'bookingFormTemplate' => $this->whenLoaded('bookingFormTemplate', fn () => $this->bookingFormTemplate ? new BookingFormTemplateResource($this->bookingFormTemplate) : null),
            'countryIds' => $this->country_ids ?? [],
            'countries' => TourLabelResolver::referenceOptionItems('country', $this->country_ids ?? []),
            'tagIds' => $this->tag_ids ?? [],
            'tags' => TourLabelResolver::blogTagItems($this->tag_ids ?? []),
            'categoryIds' => $this->category_ids ?? [],
            'categories' => TourLabelResolver::blogCategoryItems($this->category_ids ?? []),
            'price' => $priceBox['price'] ?? ($this->price !== null ? (float) $this->price : null),
            'displayedPrice' => $priceBox['displayedPrice'] ?? $this->displayed_price,
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
