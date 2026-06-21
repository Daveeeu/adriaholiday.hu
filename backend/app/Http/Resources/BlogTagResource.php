<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogTagResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'active' => (bool) $this->active,
            'sortOrder' => (int) $this->sort_order,
            'translations' => $this->whenLoaded('translations', fn () => $this->translations
                ->keyBy('locale')
                ->map(fn ($translation) => [
                    'name' => $translation->name,
                ])
                ->all()),
        ];
    }
}
