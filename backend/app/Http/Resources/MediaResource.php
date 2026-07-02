<?php

namespace App\Http\Resources;

use App\Support\MediaCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    private function fileExtension(): string
    {
        return strtolower(pathinfo((string) ($this->file_name ?? ''), PATHINFO_EXTENSION));
    }

    private function fileType(): string
    {
        $mimeType = strtolower((string) ($this->mime_type ?? ''));
        $extension = $this->fileExtension();

        if (str_starts_with($mimeType, 'image/') || in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'], true)) {
            return 'image';
        }

        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }

        if ($mimeType === 'application/pdf' || $extension === 'pdf') {
            return 'pdf';
        }

        if (in_array($mimeType, [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ], true) || in_array($extension, ['doc', 'docx', 'xls', 'xlsx'], true)) {
            return 'document';
        }

        return 'file';
    }

    private function usageLabel(): string
    {
        $sourceContext = $this->source_context ?? data_get($this->custom_properties, 'source_context');
        $sourceId = $this->source_id ?? data_get($this->custom_properties, 'source_id');

        return match ($sourceContext) {
            'blog_article' => 'Blog #'.($sourceId ?? $this->id),
            'tour' => 'Tour #'.($sourceId ?? $this->id),
            'tour_program_pdf' => 'Tour program PDF #'.($sourceId ?? $this->id),
            'tour_gallery' => 'Tour gallery #'.($sourceId ?? $this->id),
            'homepage_offer' => 'Homepage Offer #'.($sourceId ?? $this->id),
            'portfolio_content' => 'Portfolio CMS #'.($sourceId ?? $this->id),
            'region' => 'Region #'.($sourceId ?? $this->id),
            'gallery' => 'Gallery #'.($sourceId ?? $this->id),
            'partner_banner' => 'Banner #'.($sourceId ?? $this->id),
            default => 'Kézi feltöltés',
        };
    }

    public function toArray(Request $request): array
    {
        $type = $this->fileType();
        $url = method_exists($this->resource, 'getUrl') ? $this->getUrl() : null;
        $thumbnailUrl = $type === 'image' ? $url : null;
        $sizes = $type === 'image'
            ? [
                'thumbnail' => $url,
                'preview' => $url,
                'large' => $url,
                'original' => $url,
            ]
            : [
                'original' => $url,
            ];

        if (method_exists($this->resource, 'getUrl')) {
            if ($type === 'image') {
                try {
                    $thumbnailUrl = $this->getUrl('thumbnail');
                } catch (\Throwable) {
                    $thumbnailUrl = $url;
                }

                foreach (['thumbnail', 'preview', 'large'] as $size) {
                    try {
                        $sizes[$size] = $this->getUrl($size);
                    } catch (\Throwable) {
                        $sizes[$size] = $url;
                    }
                }
            }
        }

        return [
            'id' => $this->id,
            'url' => $url,
            'thumbnailUrl' => $thumbnailUrl,
            'sizes' => array_filter($sizes, static fn ($value) => is_string($value) && $value !== ''),
            'name' => $this->name,
            'fileName' => $this->file_name,
            'size' => (int) ($this->size ?? 0),
            'type' => $type,
            'extension' => $this->fileExtension(),
            'category' => MediaCategory::normalized($this->category ?? data_get($this->custom_properties, 'category')),
            'categoryLabel' => MediaCategory::labelFor($this->category ?? data_get($this->custom_properties, 'category')),
            'sourceContext' => $this->source_context ?? data_get($this->custom_properties, 'source_context'),
            'sourceId' => $this->source_id ?? data_get($this->custom_properties, 'source_id'),
            'alt' => $this->alt ?? data_get($this->custom_properties, 'alt'),
            'title' => $this->title ?? data_get($this->custom_properties, 'title'),
            'mimeType' => $this->mime_type,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'usage' => [[
                'label' => $this->usageLabel(),
                'sourceContext' => $this->source_context ?? data_get($this->custom_properties, 'source_context'),
                'sourceId' => $this->source_id ?? data_get($this->custom_properties, 'source_id'),
                'modelType' => $this->model_type,
                'modelId' => $this->model_id,
                'collectionName' => $this->collection_name,
            ]],
        ];
    }
}
