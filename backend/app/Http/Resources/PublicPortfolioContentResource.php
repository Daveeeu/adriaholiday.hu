<?php

namespace App\Http\Resources;

use App\Models\PortfolioContentBlock;
use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicPortfolioContentResource extends JsonResource
{
    private function valueForType(PortfolioContentBlock $block, bool $draft = false): mixed
    {
        $textValue = $draft ? ($block->draft_value ?? $block->value) : $block->value;

        return match ($block->type) {
            'image', 'video' => $block->mediaPayload($draft) ?? null,
            'button', 'list', 'json' => $draft ? ($block->draft_value_json ?? $block->value_json) : $block->value_json,
            'richtext' => RichTextSanitizer::sanitize(is_string($textValue) ? $textValue : null),
            default => $textValue,
        };
    }

    public function toArray(Request $request): array
    {
        return [
            'key' => $this->key,
            'type' => $this->type,
            'value' => $this->valueForType($this->resource),
        ];
    }
}
