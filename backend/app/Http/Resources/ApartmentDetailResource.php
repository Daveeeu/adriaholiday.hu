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
            'gallery' => $this->whenLoaded('gallery', fn () => $this->gallery ? new GalleryResource($this->gallery) : null),
            'galleryItems' => $this->whenLoaded('galleryItems', fn () => $this->galleryItems->map(fn ($item): array => [
                'id' => $item->id,
                'mediaId' => $item->media_id,
                'legacyImageId' => $item->legacy_image_id,
                'title' => $item->title,
                'alt' => $item->alt,
                'sortOrder' => (int) $item->sort_order,
                'active' => (bool) $item->active,
                'image' => $item->media ? new MediaResource($item->media) : null,
            ])->all()),
        ];
    }
}
