<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Http\Resources\Json\JsonResource;

class HomepageOfferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'active' => (bool) $this->active,
            'sortOrder' => (int) $this->sort_order,
            'image' => $this->image ?: $this->getFirstMediaUrl('image') ?: null,
            'imageMedia' => $this->getFirstMedia('image') ? new MediaResource($this->getFirstMedia('image')) : null,
            'imageTitle' => $this->image_title,
            'link' => $this->link,
            'translations' => $this->whenLoaded('translations', fn () => $this->translations
                ->keyBy('locale')
                ->map(fn ($translation) => [
                    'name' => $translation->name,
                    'seoName' => $translation->seo_name,
                    'seoAutoGenerate' => Str::slug($translation->name) === $translation->seo_name,
                    'shortDescription' => $translation->short_description,
                ])
                ->all()),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
