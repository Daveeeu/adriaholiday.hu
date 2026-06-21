<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'active' => (bool) $this->active,
            'vehicleCode' => $this->vehicle_code,
            'sortOrder' => (int) $this->sort_order,
            'translations' => $this->whenLoaded('translations', fn () => $this->translations
                ->keyBy('locale')
                ->map(fn ($translation) => [
                    'name' => $translation->name,
                    'seoName' => $translation->seo_name,
                    'seoAutoGenerate' => (bool) $translation->seo_auto_generate,
                ])
                ->all()),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
