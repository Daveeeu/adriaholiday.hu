<?php

namespace App\Http\Resources;

use App\Models\SeoRedirect;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin SeoRedirect
 */
class SeoRedirectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'sourcePath' => '/'.$this->source_path,
            'target' => $this->target,
            'active' => $this->active,
            'origin' => $this->origin,
            'hits' => $this->hits,
            'lastHitAt' => $this->last_hit_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
