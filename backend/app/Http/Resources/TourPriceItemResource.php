<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourPriceItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'type' => (string) $this->type,
            'text' => (string) $this->text,
            'sortOrder' => (int) $this->sort_order,
            'active' => (bool) $this->active,
        ];
    }
}
