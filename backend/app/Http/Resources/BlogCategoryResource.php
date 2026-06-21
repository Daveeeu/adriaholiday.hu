<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'active' => (bool) $this->active,
            'column' => $this->column,
            'seoName' => $this->seo_name,
            'sortOrder' => (int) $this->sort_order,
            'translations' => $this->whenLoaded('translations', fn () => $this->translations
                ->keyBy('locale')
                ->map(fn ($translation) => [
                    'name' => $translation->name,
                    'seoName' => $translation->seo_name,
                    'seoAutoGenerate' => (bool) $translation->seo_auto_generate,
                ])
                ->all()),
        ];
    }
}
