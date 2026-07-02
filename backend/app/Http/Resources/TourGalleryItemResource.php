<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourGalleryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tourId' => $this->tour_id,
            'mediaId' => $this->media_id,
            'title' => $this->title ? trim((string) $this->title) : null,
            'alt' => $this->alt ? trim((string) $this->alt) : null,
            'caption' => $this->caption ? trim((string) $this->caption) : null,
            'sortOrder' => (int) $this->sort_order,
            'active' => (bool) $this->active,
            'image' => $this->whenLoaded('media', fn () => new MediaResource($this->media), null),
        ];
    }
}
