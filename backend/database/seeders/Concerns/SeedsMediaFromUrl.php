<?php

namespace Database\Seeders\Concerns;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

trait SeedsMediaFromUrl
{
    protected function attachMediaFromUrl(
        Model $model,
        string $collection,
        string $url,
        ?string $fileName = null,
        ?string $name = null,
        array $metadata = [],
    ): void {
        if (! method_exists($model, 'addMediaFromString')) {
            return;
        }

        $contents = @file_get_contents($url);

        if ($contents === false) {
            return;
        }

        $downloaded = $model->addMediaFromString($contents);

        if ($name) {
            $downloaded->usingName($name);
        }

        $media = $downloaded
            ->usingFileName($fileName ?? basename(parse_url($url, PHP_URL_PATH) ?: $url))
            ->toMediaCollection($collection);

        $this->applyMediaMetadata($media, $metadata, $name);
    }

    protected function applyMediaMetadata(Media $media, array $metadata, ?string $fallbackTitle = null): void
    {
        $category = $metadata['category'] ?? null;
        $sourceContext = $metadata['source_context'] ?? null;
        $sourceId = $metadata['source_id'] ?? null;
        $alt = $metadata['alt'] ?? null;
        $title = $metadata['title'] ?? $fallbackTitle;

        $media->forceFill(array_filter([
            'category' => $category,
            'source_context' => $sourceContext,
            'source_id' => $sourceId,
            'alt' => $alt,
            'title' => $title,
        ], static fn ($value) => $value !== null && $value !== ''));

        $media->custom_properties = array_filter([
            ...($media->custom_properties ?? []),
            'category' => $category,
            'source_context' => $sourceContext,
            'source_id' => $sourceId,
            'alt' => $alt,
            'title' => $title,
        ], static fn ($value) => $value !== null && $value !== '');

        $media->save();
    }
}
