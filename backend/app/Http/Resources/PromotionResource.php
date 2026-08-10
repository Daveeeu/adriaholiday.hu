<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromotionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'code' => $this->code,
            'isActive' => (bool) $this->is_active,
            'startsAt' => $this->starts_at?->toDateString(),
            'expiresAt' => $this->expires_at?->toDateString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
