<?php

namespace Database\Seeders\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

trait SeedsMediaFromUrl
{
    /**
     * Attaches a demo photo downloaded from the given address. The photo is
     * optional: when it cannot be downloaded the record is seeded without it.
     */
    protected function attachMediaFromUrl(
        Model $model,
        string $collection,
        string $url,
        ?string $fileName = null,
        ?string $name = null,
        array $metadata = [],
    ): ?Media {
        if (! method_exists($model, 'addMediaFromString')) {
            return null;
        }

        $contents = $this->downloadSeedImage($url);

        if ($contents === null) {
            return null;
        }

        $downloaded = $model->addMediaFromString($contents);

        if ($name) {
            $downloaded->usingName($name);
        }

        $media = $downloaded
            ->usingFileName($fileName ?? basename(parse_url($url, PHP_URL_PATH) ?: $url))
            ->toMediaCollection($collection);

        $this->applyMediaMetadata($media, $metadata, $name);

        return $media;
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

    /**
     * The tests get a generated photo instead: they never reach the network,
     * and most of these addresses point at the live site.
     */
    private function downloadSeedImage(string $url): ?string
    {
        if (app()->runningUnitTests()) {
            return $this->placeholderJpeg();
        }

        try {
            $response = Http::timeout(10)->get($url);
        } catch (ConnectionException) {
            return null;
        }

        if (! $response->successful() || ! str_starts_with((string) $response->header('Content-Type'), 'image/')) {
            return null;
        }

        return $response->body();
    }

    private function placeholderJpeg(): string
    {
        $image = imagecreatetruecolor(120, 80);
        imagefill($image, 0, 0, (int) imagecolorallocate($image, 14, 116, 144));

        ob_start();
        imagejpeg($image);

        return (string) ob_get_clean();
    }
}
