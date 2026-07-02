<?php

namespace App\Http\Resources;

use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourRegionGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'active' => (bool) $this->active,
            'featuredOnHomepage' => (bool) $this->featured_on_homepage,
            'type' => $this->type,
            'name' => $this->name,
            'seoName' => $this->seo_name,
            'seoAutoGenerate' => (bool) $this->seo_auto_generate,
            'galleryId' => $this->gallery_id,
            'description' => RichTextSanitizer::sanitize($this->description),
            'listBelowText' => RichTextSanitizer::sanitize($this->list_below_text),
            'travelConditionsLink' => $this->travel_conditions_link,
            'relatedToursCount' => (int) ($this->tours_count ?? 0),
            'gallery' => $this->whenLoaded('gallery', fn () => new GalleryResource($this->gallery)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
