<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourDateExtraResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'priceUnit' => $this->price_unit,
            'mandatory' => (bool) $this->mandatory,
            'sortOrder' => (int) $this->sort_order,
        ];
    }
}
