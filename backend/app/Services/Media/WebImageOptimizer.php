<?php

namespace App\Services\Media;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Image\Enums\Fit;
use Spatie\Image\Image;
use Throwable;

/**
 * Turns an uploaded photo into a web-sized WebP before it reaches the media
 * library, so a camera original or a screenshot is not stored and served at
 * many megabytes.
 *
 * JPEG, PNG and WebP images are scaled down to MAX_SIDE pixels on their long
 * side and re-encoded as WebP; everything else (GIF animations, SVG, PDF,
 * documents, videos) is passed through untouched.
 */
class WebImageOptimizer
{
    public function __construct(private readonly ImageRightsReader $rights) {}

    /** Long side of a stored photo: sharp on a large screen, small on disk. */
    public const MAX_SIDE = 2560;

    /** Largest upload accepted for a convertible photo, in kilobytes; it is stored far smaller. */
    public const MAX_UPLOAD_KILOBYTES = 40 * 1024;

    /** Largest photo dimension accepted, so decoding stays within the PHP memory limit. */
    public const MAX_UPLOAD_DIMENSION = 8000;

    public const CONVERTIBLE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    private const QUALITY = 82;

    public function isConvertible(?string $mimeType): bool
    {
        return in_array(Str::lower((string) $mimeType), self::CONVERTIBLE_MIME_TYPES, true);
    }

    /**
     * The file to store and its name: a temporary WebP for a convertible
     * photo (the media library moves it away), otherwise the file as given;
     * with the author and copyright read from the original first, since the
     * conversion drops them.
     */
    public function optimize(UploadedFile|string $file, string $fileName): OptimizedImage
    {
        $path = $file instanceof UploadedFile ? $file->getRealPath() : $file;
        $mimeType = $file instanceof UploadedFile ? $file->getMimeType() : mime_content_type($path);

        if (! is_string($path)) {
            return new OptimizedImage($file, $fileName, false, []);
        }

        $rights = $this->rights->read($path);

        if (! $this->isConvertible($mimeType ?: null)) {
            return new OptimizedImage($file, $fileName, false, $rights);
        }

        $target = sys_get_temp_dir().'/web-image-'.Str::random(16).'.webp';

        try {
            Image::load($path)
                ->fit(Fit::Max, self::MAX_SIDE, self::MAX_SIDE)
                ->format('webp')
                ->quality(self::QUALITY)
                ->save($target);
        } catch (Throwable $exception) {
            @unlink($target);
            report($exception);

            throw ValidationException::withMessages([
                'file' => 'A képet nem sikerült feldolgozni. Lehet, hogy sérült; próbáld meg újra elmenteni JPG-ként.',
            ]);
        }

        return new OptimizedImage($target, pathinfo($fileName, PATHINFO_FILENAME).'.webp', true, $rights);
    }
}
