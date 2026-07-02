<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class PublicHomepageOfferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $translation = $this->translations->firstWhere('locale', 'hu')
            ?? $this->translations->first();
        $media = $this->getFirstMedia('image');
        $imageUrl = $media?->getUrl() ?: ($this->image ?: null);

        return [
            'id' => $this->id,
            'name' => (string) ($translation?->name ?? $this->image_title ?? ''),
            'seoName' => (string) ($translation?->seo_name ?: Str::slug((string) ($translation?->name ?? $this->image_title ?? ''))),
            'shortDescription' => (string) ($translation?->short_description ?? ''),
            'link' => (string) ($this->link ?? ''),
            'image' => $media
                ? new MediaResource($media)
                : [
                    'id' => null,
                    'url' => $imageUrl,
                    'thumbnailUrl' => $imageUrl,
                    'sizes' => $imageUrl ? [
                        'thumbnail' => $imageUrl,
                        'preview' => $imageUrl,
                        'large' => $imageUrl,
                        'original' => $imageUrl,
                    ] : [],
                    'name' => (string) ($this->image_title ?? $translation?->name ?? ''),
                    'fileName' => null,
                    'size' => null,
                ],
            'sortOrder' => (int) $this->sort_order,
            'active' => (bool) $this->active,
        ];
    }
}
