<?php

namespace App\Http\Resources;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Page
 */
class PublicPageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'seoTitle' => $this->seo_title,
            'seoDescription' => $this->seo_description,
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
