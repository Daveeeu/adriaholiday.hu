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
            'startsAt' => $this->starts_at?->toDateString(),
            'expiresAt' => $this->expires_at?->toDateString(),
            'usageConditions' => $this->usage_conditions,
            'used' => (bool) $this->used,
            'maxUses' => $this->max_uses !== null ? (int) $this->max_uses : null,
            'usedCount' => (int) $this->used_count,
            'status' => $this->derivedStatus(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }

    private function derivedStatus(): string
    {
        if ($this->used || ($this->max_uses !== null && $this->used_count >= $this->max_uses)) {
            return 'used';
        }

        if (! $this->active) {
            return 'expired';
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return 'expired';
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return 'scheduled';
        }

        return 'active';
    }
}
