<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ApartmentDetailResource extends ApartmentResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + [
            'region' => $this->whenLoaded('region', fn () => new RegionResource($this->region)),
            'location' => $this->whenLoaded('location', fn () => new LocationResource($this->location)),
            'gallery' => $this->whenLoaded('gallery', fn () => new GalleryResource($this->gallery)),
        ];
    }
}
