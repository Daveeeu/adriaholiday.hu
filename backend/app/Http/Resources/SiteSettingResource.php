<?php

namespace App\Http\Resources;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiteSettingResource extends JsonResource
{
    /**
     * @mixin SiteSetting
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group' => $this->group,
            'key' => $this->key,
            'type' => $this->type,
            'isPublic' => $this->is_public,
            'value' => $this->decodedValue(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
