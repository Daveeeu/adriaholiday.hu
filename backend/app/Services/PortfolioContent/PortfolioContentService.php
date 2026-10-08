<?php

namespace App\Services\PortfolioContent;

use App\Models\PortfolioContentBlock;
use App\Support\MediaCategory;
use App\Support\RichTextSanitizer;
use Illuminate\Http\UploadedFile;
use InvalidArgumentException;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Draft media uploads and publishing of the editable portfolio content blocks,
 * shared by the admin API and the console.
 */
class PortfolioContentService
{
    /**
     * Replaces the block's draft media with the given file.
     *
     * @param  array{alt?: ?string, title?: ?string, category?: ?string, sourceContext?: ?string, sourceId?: ?int}  $attributes
     */
    public function storeDraftMedia(PortfolioContentBlock $block, UploadedFile|string $file, string $fileName, array $attributes = []): Media
    {
        $collectionName = $block->draftMediaCollectionName();

        if ($collectionName === null) {
            throw new InvalidArgumentException("The [{$block->key}] block does not hold media.");
        }

        $block->clearMediaCollection($collectionName);

        $media = $block->addMedia($file)
            ->preservingOriginal()
            ->usingName(pathinfo($fileName, PATHINFO_FILENAME))
            ->usingFileName($fileName)
            ->toMediaCollection($collectionName);

        $properties = [
            'category' => MediaCategory::normalized($attributes['category'] ?? MediaCategory::PORTFOLIO->value),
            'source_context' => $attributes['sourceContext'] ?? 'portfolio_content',
            'source_id' => $attributes['sourceId'] ?? $block->id,
            'alt' => $attributes['alt'] ?? null,
            'title' => $attributes['title'] ?? null,
        ];

        $media->forceFill($properties);
        $media->custom_properties = array_filter([
            ...($media->custom_properties ?? []),
            ...$properties,
        ], static fn ($value) => $value !== null && $value !== '');
        $media->save();

        $block->updateDraftMediaMetadata([
            'alt' => $properties['alt'],
            'title' => $properties['title'],
        ]);

        return $media;
    }

    /**
     * Promotes the block's draft value and draft media to the published version.
     */
    public function publish(PortfolioContentBlock $block, ?int $userId): void
    {
        $block->forceFill([
            'value' => $block->type === 'richtext'
                ? RichTextSanitizer::sanitize($block->draft_value ?? $block->value)
                : $block->draft_value ?? $block->value,
            'value_json' => $block->draft_value_json ?? $block->value_json,
            'draft_value' => null,
            'draft_value_json' => null,
            'is_published' => true,
            'updated_by' => $userId,
        ])->save();

        $block->publishDraftMedia();
    }
}
