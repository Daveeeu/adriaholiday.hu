<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'regionId' => $this->region_id,
            'slug' => $this->slug,
            'name' => $this->name,
            'type' => $this->type,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'transferMinutesFromAirport' => (int) $this->transfer_minutes_from_airport,
            'description' => $this->description,
            'featured' => (bool) $this->featured,
            'isActive' => (bool) $this->is_active,
            'sortOrder' => (int) $this->sort_order,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
