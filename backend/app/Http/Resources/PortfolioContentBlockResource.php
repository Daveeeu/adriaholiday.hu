<?php

namespace App\Http\Resources;

use App\Models\PortfolioContentBlock;
use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioContentBlockResource extends JsonResource
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
            'label' => $this->label,
            'type' => $this->type,
            'page' => $this->page,
            'section' => $this->section,
            'locale' => $this->locale,
            'publishedValue' => $this->valueForType($this->resource, false),
            'draftValue' => $this->valueForType($this->resource, true),
            'publishedMedia' => $this->when(
                in_array($this->type, ['image', 'video'], true),
                fn () => $this->resource->mediaPayload(false),
            ),
            'draftMedia' => $this->when(
                in_array($this->type, ['image', 'video'], true),
                fn () => $this->resource->mediaPayload(true),
            ),
            'hasDraft' => filled($this->draft_value) || filled($this->draft_value_json) || $this->hasDraftMedia(),
            'isPublished' => (bool) $this->is_published,
            'updatedBy' => $this->updated_by,
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
