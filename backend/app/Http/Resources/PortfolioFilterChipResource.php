<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioFilterChipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'scopeType' => $this->scope_type,
            'scopeValue' => $this->scope_value,
            'label' => $this->label,
            'slug' => $this->slug,
            'icon' => $this->icon,
            'filterType' => $this->filter_type,
            'filterValue' => $this->filter_value,
            'filterConfig' => $this->filter_config,
            'sortOrder' => (int) $this->sort_order,
            'active' => (bool) $this->active,
            'hideWhenZero' => (bool) $this->hide_when_zero,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
