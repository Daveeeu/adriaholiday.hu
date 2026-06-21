<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
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
            'listDescription' => $this->list_description,
            'shortDescription' => $this->short_description,
            'programPdfPath' => $this->program_pdf_path,
            'programPdf' => $this->program_pdf_path,
            'programPdfFile' => $this->program_pdf_file,
            'sliderImage' => $this->slider_image,
            'programBefore' => $this->program_before,
            'program' => $this->program,
            'inclusions' => $this->inclusions,
            'paymentProgram' => $this->payment_program,
            'prices' => $this->prices,
            'discounts' => $this->discounts,
            'notes' => $this->notes,
            'regionId' => $this->region_id,
            'groupId' => $this->group_id,
            'seasonalGroupId' => $this->seasonal_group_id,
            'fitId' => $this->fit_id,
            'programTypeId' => $this->program_type_id,
            'travelModeId' => $this->travel_mode_id,
            'difficultyId' => $this->difficulty_id,
            'countryIds' => $this->country_ids ?? [],
            'tagIds' => $this->tag_ids ?? [],
            'categoryIds' => $this->category_ids ?? [],
            'price' => $this->price !== null ? (float) $this->price : null,
            'displayedPrice' => $this->displayed_price,
            'sliderText' => $this->slider_text,
            'sliderImageMedia' => $this->getFirstMedia('slider') ? new MediaResource($this->getFirstMedia('slider')) : null,
            'programPdfMedia' => $this->getFirstMedia('pdf') ? new MediaResource($this->getFirstMedia('pdf')) : null,
            'departurePlaceIds' => $this->whenLoaded('departurePlaces', fn () => $this->departurePlaces->pluck('id')->values()->all(), []),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
