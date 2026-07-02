<?php

namespace App\Http\Resources;

use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class PortfolioBlogArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $translation = $this->translations->firstWhere('locale', 'hu')
            ?? $this->translations->first();
        $category = $this->categories->first();
        $categoryTranslation = $category?->translations->firstWhere('locale', 'hu')
            ?? $category?->translations->first();
        $media = $this->getFirstMedia('cover');
        $content = trim((string) ($translation?->content ?? $translation?->excerpt ?? ''));
        $wordCount = str_word_count(strip_tags($content));
        $readingTime = max(1, (int) ceil(max($wordCount, 1) / 180));

        return [
            'id' => $this->id,
            'slug' => $translation?->seo_name ?: Str::slug((string) ($translation?->title ?? $this->image_title)),
            'title' => (string) ($translation?->title ?? $this->image_title),
            'excerpt' => RichTextSanitizer::sanitize((string) ($translation?->excerpt ?? '')),
            'image' => $media?->getUrl() ?: $this->image ?: null,
            'imageMedia' => $media ? new MediaResource($media) : null,
            'publishedAt' => $this->published_at?->toISOString(),
            'publishedAtLabel' => $this->published_at?->locale('hu')->translatedFormat('Y. F j.'),
            'category' => $categoryTranslation?->name ?? null,
            'categorySlug' => $category?->seo_name ?? null,
            'tagNames' => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($tag) => $tag->translations->firstWhere('locale', 'hu')?->name ?? $tag->translations->first()?->name)->filter()->values()->all(), []),
            'readingTime' => "{$readingTime} perc",
        ];
    }
}
