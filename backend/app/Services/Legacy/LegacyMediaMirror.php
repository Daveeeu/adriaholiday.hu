<?php

namespace App\Services\Legacy;

use App\Models\AdminMediaItem;
use App\Models\LegacyMediaFile;
use App\Support\MediaCategory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Spatie\Image\Enums\Fit;
use Spatie\Image\Image;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Throwable;

/**
 * Copies files of the legacy website (gallery images, slider images, PDFs,
 * images in texts) into the shared media library, so the new site keeps
 * showing them after the legacy site is gone. Every URL is recorded in
 * legacy_media_files with the media it became or why it could not be
 * copied. A URL already copied, or a file whose content is already in the
 * library, is never stored again.
 */
class LegacyMediaMirror
{
    public const SOURCE_CONTEXT = 'legacy-import';

    private const MAX_IMAGE_SIDE = 2560;

    private const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

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
     * Number of files actually downloaded since this instance was created.
     */
    public function downloadCount(): int
    {
        return $this->downloadCount;
    }

    /**
     * The media a legacy URL was copied to, if it was.
     */
    public function media(string $url): ?Media
    {
        $file = LegacyMediaFile::query()->forUrl($url)->where('status', LegacyMediaFile::MIRRORED)->with('media')->first();

        return $file?->media ?? $this->mediaOfEarlierImport($url);
    }

    /**
     * The site-relative URL of a legacy file's copy (independent of the
     * site's domain), if it was copied.
     */
    public function localUrl(string $url): ?string
    {
        $media = $this->media($url);

        return $media !== null ? (parse_url($media->getUrl(), PHP_URL_PATH) ?: null) : null;
    }

    /**
     * Copies a legacy file into the media library unless it already is.
     * A failure is recorded, never thrown.
     *
     * @param  array{alt?: ?string, title?: ?string, caption?: ?string, category?: MediaCategory}  $meta  category defaults to tours
     */
    public function mirror(string $url, array $meta = []): LegacyMediaFile
    {
        $file = LegacyMediaFile::query()->forUrl($url)->first()
            ?? new LegacyMediaFile(['legacy_url' => $url, 'legacy_url_sha256' => LegacyMediaFile::urlHash($url), 'attempts' => 0]);

        if ($file->status === LegacyMediaFile::MIRRORED && $file->media()->exists()) {
            return $file;
        }

        $earlier = $this->mediaOfEarlierImport($url);

        if ($earlier !== null) {
            return $this->recordMirrored($file, $earlier, null, null);
        }

        $file->fill(['attempts' => $file->attempts + 1, 'last_attempt_at' => now()]);

        try {
            $body = $this->download($url);
            $contentHash = hash('sha256', $body);
            $media = $this->mediaWithContent($contentHash) ?? $this->store($url, $body, $meta);
        } catch (Throwable $exception) {
            // One file that cannot be copied never stops the others; it is recorded and reported.
            if (! $exception instanceof LegacyFetchException) {
                report($exception);
            }

            $file->fill([
                'status' => LegacyMediaFile::FAILED,
                'error' => Str::limit($exception->getMessage(), 1000),
                'http_status' => $exception instanceof LegacyFetchException ? ($exception->getCode() ?: null) : null,
            ])->save();

            return $file;
        }

        return $this->recordMirrored($file, $media, $contentHash, strlen($body));
    }

    /**
     * Whether a legacy file can be downloaded, without downloading it.
     *
     * @return array{ok: bool, http_status: int|null, error: string|null}
     */
    public function check(string $url): array
    {
        $this->throttle();

        try {
            $response = Http::withUserAgent($this->userAgent)->timeout($this->timeout)->retry(2, 500, throw: false)->head($url);
        } catch (Throwable $exception) {
            return ['ok' => false, 'http_status' => null, 'error' => $exception->getMessage()];
        }

        $type = strtolower(trim(explode(';', (string) $response->header('Content-Type'))[0]));

        return match (true) {
            ! $response->successful() => ['ok' => false, 'http_status' => $response->status(), 'error' => "HTTP {$response->status()}"],
            // No type at all (e.g. a legacy "photo.jpg!d"): the mirror checks the content itself.
            $type !== '' && ! in_array($type, self::ALLOWED_TYPES, true) => ['ok' => false, 'http_status' => $response->status(), 'error' => "Unexpected content type \"{$type}\""],
            default => ['ok' => true, 'http_status' => $response->status(), 'error' => null],
        };
    }

    /**
     * @throws LegacyFetchException
     */
    private function download(string $url): string
    {
        $this->throttle();

        try {
            $response = Http::withUserAgent($this->userAgent)->timeout($this->timeout)->retry(2, 500, throw: false)->get($url);
        } catch (Throwable $exception) {
            throw new LegacyFetchException("Failed to download {$url}: {$exception->getMessage()}", previous: $exception);
        }

        if ($response->failed()) {
            throw new LegacyFetchException("Failed to download {$url}: HTTP {$response->status()}", $response->status());
        }

        $body = $response->body();

        if ($body === '') {
            throw new LegacyFetchException("Failed to download {$url}: empty file", $response->status());
        }

        if (! $this->isPdf($body) && @getimagesizefromstring($body) === false) {
            throw new LegacyFetchException("Failed to download {$url}: not an image or PDF", $response->status());
        }

        $this->downloadCount++;

        return $body;
    }

    /**
     * @param  array{alt?: ?string, title?: ?string, caption?: ?string, category?: MediaCategory}  $meta
     */
    private function store(string $url, string $body, array $meta): Media
    {
        $fileName = $this->fileNameFromUrl($url);
        $body = $this->withinSizeLimit($body, $fileName);
        $title = $meta['title'] ?? pathinfo($fileName, PATHINFO_FILENAME);
        $category = ($meta['category'] ?? MediaCategory::TOURS)->value;

        $media = AdminMediaItem::create()
            ->addMediaFromString($body)
            ->usingName($title)
            ->usingFileName($fileName)
            ->toMediaCollection('library');

        $media->forceFill([
            'category' => $category,
            'source_context' => self::SOURCE_CONTEXT,
            'alt' => $meta['alt'] ?? null,
            'title' => $title,
        ]);
        $media->custom_properties = array_filter([
            ...($media->custom_properties ?? []),
            'category' => $category,
            'source_context' => self::SOURCE_CONTEXT,
            'alt' => $meta['alt'] ?? null,
            'title' => $title,
            'caption' => $meta['caption'] ?? null,
            'legacy_url' => $url,
        ], static fn ($value): bool => $value !== null && $value !== '');
        $media->save();

        return $media;
    }

    /**
     * A photo larger than the media library accepts (some legacy uploads are
     * camera originals of 10+ MB) is scaled down to 2560 pixels on its long
     * side; anything else is stored as it is.
     */
    private function withinSizeLimit(string $body, string $fileName): string
    {
        if (strlen($body) <= (int) config('media-library.max_file_size') || $this->isPdf($body)) {
            return $body;
        }

        $path = tempnam(sys_get_temp_dir(), 'legacy-media-').'.'.(pathinfo($fileName, PATHINFO_EXTENSION) ?: 'jpg');

        try {
            file_put_contents($path, $body);
            Image::load($path)->fit(Fit::Max, self::MAX_IMAGE_SIDE, self::MAX_IMAGE_SIDE)->quality(82)->save();

            return (string) file_get_contents($path);
        } finally {
            @unlink($path);
        }
    }

    private function recordMirrored(LegacyMediaFile $file, Media $media, ?string $contentHash, ?int $bytes): LegacyMediaFile
    {
        $file->fill([
            'status' => LegacyMediaFile::MIRRORED,
            'media_id' => $media->id,
            'content_sha256' => $contentHash ?? $file->content_sha256,
            'bytes' => $bytes ?? $media->size,
            'error' => null,
            'http_status' => null,
        ])->save();

        return $file;
    }

    /**
     * Media an earlier legacy import (LegacyMediaImporter before this
     * mirror) stored for the URL.
     */
    private function mediaOfEarlierImport(string $url): ?Media
    {
        return Media::query()
            ->where('source_context', self::SOURCE_CONTEXT)
            ->where('custom_properties->legacy_url', $url)
            ->first();
    }

    private function mediaWithContent(string $contentHash): ?Media
    {
        return LegacyMediaFile::query()
            ->where('content_sha256', $contentHash)
            ->where('status', LegacyMediaFile::MIRRORED)
            ->whereHas('media')
            ->first()
            ?->media;
    }

    private function isPdf(string $body): bool
    {
        return str_starts_with($body, '%PDF');
    }

    private function fileNameFromUrl(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH) ?: null;
        // Legacy file names are percent-encoded in the URL ("Prague_%28…%29.jpg").
        $name = $path !== null ? basename(rawurldecode($path)) : '';

        return $name !== '' ? $name : Str::random(16).'.jpg';
    }

    private function throttle(): void
    {
        if ($this->delayMs > 0) {
            usleep($this->delayMs * 1000);
        }
    }
}
