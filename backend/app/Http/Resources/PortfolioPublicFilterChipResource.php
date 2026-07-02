<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioPublicFilterChipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'label' => $this['label'],
            'slug' => $this['slug'],
            'icon' => $this['icon'],
            'type' => $this['type'],
            'value' => $this['value'],
            'count' => (int) $this['count'],
            'disabled' => (bool) $this['disabled'],
            'active' => (bool) ($this['active'] ?? false),
        ];
    }
}
