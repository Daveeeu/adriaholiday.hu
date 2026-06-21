<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'active' => (bool) $this->active,
            'name' => $this->name,
            'email' => $this->email,
            'code' => $this->code,
            'value' => $this->value !== null ? (float) $this->value : null,
            'expiresAt' => $this->expires_at?->toDateString(),
            'used' => (bool) $this->used,
            'status' => $this->derivedStatus(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }

    private function derivedStatus(): string
    {
        if ($this->used) {
            return 'used';
        }

        if (! $this->active) {
            return 'expired';
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return 'expired';
        }

        return 'active';
    }
}
