<?php

namespace App\Services\Legacy;

use App\Models\AdminMediaItem;
use App\Support\MediaCategory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Downloads a legacy image into the shared Media library (via AdminMediaItem,
 * the same "not owned by one business record" pattern MediaController already
 * uses), reusing an existing Media row when the same source URL was already
 * imported instead of downloading and storing it again.
 */
class LegacyMediaImporter
{
    private const SOURCE_CONTEXT = 'legacy-import';

    private readonly string $userAgent;

    private readonly int $timeout;

    private readonly int $delayMs;

    private int $downloadCount = 0;

    public function __construct()
    {
        $this->userAgent = (string) config('services.legacy_adria.user_agent');
        $this->timeout = (int) config('services.legacy_adria.timeout');
        $this->delayMs = (int) config('services.legacy_adria.request_delay_ms');
    }

    /**
     * Number of images actually downloaded (not reused) since this instance was created.
     */
    public function downloadCount(): int
    {
        return $this->downloadCount;
    }

    /**
     * @param  array{alt?: ?string, title?: ?string, caption?: ?string}  $meta
     *
     * @throws LegacyFetchException
     */
    public function importImage(string $absoluteUrl, array $meta = []): Media
    {
        $existing = $this->findExisting($absoluteUrl);

        if ($existing !== null) {
            return $existing;
        }

        $this->throttle();

        try {
            $response = Http::withUserAgent($this->userAgent)
                ->timeout($this->timeout)
                ->retry(2, 500)
                ->get($absoluteUrl);
        } catch (\Throwable $exception) {
            throw new LegacyFetchException("Failed to download image {$absoluteUrl}: {$exception->getMessage()}", previous: $exception);
        }

        if ($response->failed()) {
            throw new LegacyFetchException("Failed to download image {$absoluteUrl}: HTTP {$response->status()}");
        }

        $fileName = $this->fileNameFromUrl($absoluteUrl);
        $title = $meta['title'] ?? pathinfo($fileName, PATHINFO_FILENAME);

        $item = AdminMediaItem::create();
        $media = $item->addMediaFromString($response->body())
            ->usingName($title)
            ->usingFileName($fileName)
            ->toMediaCollection('library');

        $media->forceFill([
            'category' => MediaCategory::TOURS->value,
            'source_context' => self::SOURCE_CONTEXT,
            'alt' => $meta['alt'] ?? null,
            'title' => $title,
        ]);
        $media->custom_properties = array_filter([
            ...($media->custom_properties ?? []),
            'category' => MediaCategory::TOURS->value,
            'source_context' => self::SOURCE_CONTEXT,
            'alt' => $meta['alt'] ?? null,
            'title' => $title,
            'caption' => $meta['caption'] ?? null,
            'legacy_url' => $absoluteUrl,
        ], static fn ($value): bool => $value !== null && $value !== '');
        $media->save();

        $this->downloadCount++;

        return $media;
    }

    private function findExisting(string $absoluteUrl): ?Media
    {
        return Media::query()
            ->where('source_context', self::SOURCE_CONTEXT)
            ->where('custom_properties->legacy_url', $absoluteUrl)
            ->first();
    }

    private function fileNameFromUrl(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH) ?: null;
        $name = $path !== null ? basename($path) : '';

        return $name !== '' ? $name : Str::random(16).'.jpg';
    }

    private function throttle(): void
    {
        if ($this->delayMs > 0) {
            usleep($this->delayMs * 1000);
        }
    }
}
