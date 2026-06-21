<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class BlogArticleDetailResource extends BlogArticleResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + [
            'categories' => $this->whenLoaded('categories', fn () => BlogCategoryResource::collection($this->categories)->resolve()),
            'tags' => $this->whenLoaded('tags', fn () => BlogTagResource::collection($this->tags)->resolve()),
        ];
    }
}
