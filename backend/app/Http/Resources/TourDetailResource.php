<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class TourDetailResource extends TourResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + [
            'region' => $this->whenLoaded('region', fn () => new RegionResource($this->region)),
            'dates' => $this->whenLoaded('dates', fn () => TourDateResource::collection($this->dates)->resolve(), []),
            'partnerBonuses' => $this->whenLoaded('partnerBonuses', fn () => TourPartnerBonusResource::collection($this->partnerBonuses)->resolve(), []),
            'departurePlaces' => $this->whenLoaded('departurePlaces', fn () => TourDeparturePlaceResource::collection($this->departurePlaces)->resolve(), []),
        ];
    }
}
