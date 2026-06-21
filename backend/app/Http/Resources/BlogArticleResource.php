<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'active' => (bool) $this->active,
            'publishedAt' => $this->published_at?->toISOString(),
            'showOnHomepage' => (bool) $this->show_on_homepage,
            'image' => $this->image ?: $this->getFirstMediaUrl('cover') ?: null,
            'imageMedia' => $this->getFirstMedia('cover') ? new MediaResource($this->getFirstMedia('cover')) : null,
            'imageTitle' => $this->image_title,
            'views' => (int) $this->views,
            'sortOrder' => (int) $this->sort_order,
            'categoryIds' => $this->whenLoaded('categories', fn () => $this->categories->pluck('id')->values()->all(), []),
            'tagIds' => $this->whenLoaded('tags', fn () => $this->tags->pluck('id')->values()->all(), []),
            'translations' => $this->whenLoaded('translations', fn () => $this->translations
                ->keyBy('locale')
                ->map(fn ($translation) => [
                    'title' => $translation->title,
                    'seoName' => $translation->seo_name,
                    'seoAutoGenerate' => Str::slug($translation->title) === $translation->seo_name,
                    'excerpt' => $translation->excerpt,
                    'content' => $translation->content,
                ])
                ->all()),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
