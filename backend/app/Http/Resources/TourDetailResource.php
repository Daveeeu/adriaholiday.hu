<?php

namespace App\Http\Resources;

use App\Support\PartnerXml\PartnerXmlSettings;
use Illuminate\Http\Request;

class TourDetailResource extends TourResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'region' => $this->region ? new RegionResource($this->region) : null,
            'dates' => TourDateResource::collection($this->dates)->resolve(),
            'partnerBonuses' => TourPartnerBonusResource::collection($this->partnerBonuses)->resolve(),
            // Admin only (the public offer leaves it out).
            'partnerXml' => PartnerXmlSettings::normalize($this->partner_xml),
            'departurePlaces' => TourDeparturePlaceResource::collection($this->departurePlaces)->resolve(),
            'priceItems' => TourPriceItemResource::collection($this->priceItems)->resolve(),
            'galleryTitle' => $this->gallery_title ? trim((string) $this->gallery_title) : null,
            'gallerySubtitle' => $this->gallery_subtitle ? trim((string) $this->gallery_subtitle) : null,
            'gallery' => TourGalleryItemResource::collection(
                ($this->galleryItems ?? collect())
                    ->where('active', true)
                    ->values(),
            )->resolve($request),
        ]);
    }
}
