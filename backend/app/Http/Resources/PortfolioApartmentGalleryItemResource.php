<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An apartment gallery image on the public site, shaped like a tour's
 * gallery item so the same gallery shows both.
 */
class PortfolioApartmentGalleryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mediaId' => $this->media_id,
            'title' => $this->title ? trim((string) $this->title) : null,
            'alt' => $this->alt ? trim((string) $this->alt) : null,
            'caption' => null,
            'sortOrder' => (int) $this->sort_order,
            'active' => (bool) $this->active,
            'image' => $this->media !== null ? new MediaResource($this->media) : null,
        ];
    }
}
