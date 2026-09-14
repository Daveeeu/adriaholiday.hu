<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioPublicCountryOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'code' => $this['code'],
            'label' => $this['label'],
            'count' => (int) $this['count'],
            'disabled' => (bool) $this['disabled'],
            'active' => (bool) $this['active'],
        ];
    }
}
