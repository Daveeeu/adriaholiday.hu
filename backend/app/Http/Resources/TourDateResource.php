<?php

namespace App\Http\Resources;

use App\Support\PriceBoxData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourDateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $priceBox = PriceBoxData::fromDate($this->resource);

        return [
            'id' => $this->id,
            'tourId' => $this->tour_id,
            'startDate' => $this->start_date?->toDateString(),
            'endDate' => $this->end_date?->toDateString(),
            'price' => $this->price !== null ? (float) $this->price : null,
            'displayedPrice' => $priceBox['displayedPrice'] ?? null,
            'priceBox' => $priceBox,
            'status' => $this->status,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
