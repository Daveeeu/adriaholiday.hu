<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'regionId' => $this->region_id,
            'title' => $this->title,
            'category' => $this->category,
            'isActive' => (bool) $this->is_active,
            'sortOrder' => (int) $this->sort_order,
            'images' => $this->whenLoaded('media', fn () => MediaResource::collection($this->getMedia('gallery'))->resolve(), []),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
