<?php

namespace App\Http\Resources;

use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $media = $this->getFirstMedia('portfolio-image');

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'countryCode' => $this->country_code,
            'timezone' => $this->timezone,
            'currency' => $this->currency,
            'heroImageUrl' => $this->hero_image_url,
            'summary' => RichTextSanitizer::sanitize($this->summary),
            'description' => RichTextSanitizer::sanitize($this->description),
            'isActive' => (bool) $this->is_active,
            'sortOrder' => (int) $this->sort_order,
            'portfolioFeatured' => (bool) $this->portfolio_featured,
            'portfolioSortOrder' => (int) $this->portfolio_sort_order,
            'portfolioImageUrl' => $this->portfolio_image_url ?: $media?->getUrl(),
            'portfolioImageMedia' => $media ? new MediaResource($media) : null,
            'portfolioShortDescription' => RichTextSanitizer::sanitize($this->portfolio_short_description),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
