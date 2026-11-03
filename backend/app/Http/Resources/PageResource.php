<?php

namespace App\Http\Resources;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Page
 */
class PageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'kind' => $this->kind,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'seoTitle' => $this->seo_title,
            'seoDescription' => $this->seo_description,
            'seoRobots' => $this->seo_robots,
            'active' => $this->active,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
