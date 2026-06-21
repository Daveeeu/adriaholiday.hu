<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $url = method_exists($this->resource, 'getUrl') ? $this->getUrl() : null;
        $thumbnailUrl = $url;

        if (method_exists($this->resource, 'getUrl')) {
            try {
                $thumbnailUrl = $this->getUrl('thumbnail');
            } catch (\Throwable) {
                $thumbnailUrl = $url;
            }
        }

        return [
            'id' => $this->id,
            'url' => $url,
            'thumbnailUrl' => $thumbnailUrl,
            'name' => $this->name,
            'fileName' => $this->file_name,
            'size' => (int) ($this->size ?? 0),
        ];
    }
}
