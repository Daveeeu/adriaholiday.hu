<?php

namespace App\Http\Resources;

use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PortfolioBlogArticleDetailResource extends PortfolioBlogArticleResource
{
    public function toArray(Request $request): array
    {
        $base = parent::toArray($request);
        $translation = $this->translations->firstWhere('locale', 'hu')
            ?? $this->translations->first();

        return $base + [
            'content' => RichTextSanitizer::sanitize((string) ($translation?->content ?? '')),
            'categories' => $this->whenLoaded('categories', fn () => $this->categories->map(function ($category) {
                $translation = $category->translations->firstWhere('locale', 'hu')
                    ?? $category->translations->first();

                return [
                    'id' => $category->id,
                    'name' => $translation?->name ?? '',
                    'slug' => $category->seo_name ?? Str::slug((string) ($translation?->name ?? '')),
                ];
            })->values()->all(), []),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map(function ($tag) {
                $translation = $tag->translations->firstWhere('locale', 'hu')
                    ?? $tag->translations->first();

                return [
                    'id' => $tag->id,
                    'name' => $translation?->name ?? '',
                    'slug' => $tag->seo_name ?? Str::slug((string) ($translation?->name ?? '')),
                ];
            })->values()->all(), []),
        ];
    }
}
