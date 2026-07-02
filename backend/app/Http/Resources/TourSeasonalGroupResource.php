<?php

namespace App\Http\Resources;

use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourSeasonalGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'active' => (bool) $this->active,
            'menuType' => $this->menu_type,
            'name' => $this->name,
            'seoName' => $this->seo_name,
            'seoAutoGenerate' => (bool) $this->seo_auto_generate,
            'boxText' => RichTextSanitizer::sanitize($this->box_text),
            'hasOffers' => (bool) $this->has_offers,
            'relatedToursCount' => (int) ($this->tours_count ?? 0),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
