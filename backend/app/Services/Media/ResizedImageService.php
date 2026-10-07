<?php

namespace App\Services\Media;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Image\Enums\Constraint;
use Spatie\Image\Image;

/**
 * Serves web-sized WebP copies of the images on the public disk.
 *
 * A copy lives at img/{width}/{source path}.webp on the same disk, so the web
 * server can hand it out directly after the first request created it.
 */
class ResizedImageService
{
    /** The only widths offered, so the cache cannot be flooded with arbitrary sizes. */
    public const WIDTHS = [400, 800, 1200, 1920];

    public const DIRECTORY = 'img';

    private const SOURCE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    private const QUALITY = 78;

    /**
     * Returns the absolute path of the resized copy, creating it when needed,
     * or null when the request does not name a resizable image.
     */
    public function resolve(int $width, string $sourcePath): ?string
    {
        if (! in_array($width, self::WIDTHS, true) || ! $this->isAllowedSource($sourcePath)) {
            return null;
        }

        $disk = $this->disk();

        if (! $disk->exists($sourcePath)) {
            return null;
        }

        $target = self::DIRECTORY."/{$width}/{$sourcePath}.webp";

        if (! $disk->exists($target)) {
            $this->create($disk, $width, $sourcePath, $target);
        }

        return $disk->path($target);
    }

    private function isAllowedSource(string $path): bool
    {
        $segments = explode('/', $path);

        return $path !== ''
            && ! str_contains($path, "\0")
            && ! str_starts_with($path, self::DIRECTORY.'/')
            && ! in_array('..', $segments, true)
            && ! in_array('.', $segments, true)
            && ! in_array('', $segments, true)
            && in_array(Str::lower(pathinfo($path, PATHINFO_EXTENSION)), self::SOURCE_EXTENSIONS, true);
    }

    private function create(Filesystem $disk, int $width, string $sourcePath, string $target): void
    {
        $disk->makeDirectory(dirname($target));

        // Written next to the target and renamed, so a parallel request never serves a half-written file.
        $temporary = $disk->path($target).'.'.Str::random(8).'.webp';

        Image::load($disk->path($sourcePath))
            ->width($width, [Constraint::PreserveAspectRatio, Constraint::DoNotUpsize])
            ->format('webp')
            ->quality(self::QUALITY)
            ->save($temporary);

        rename($temporary, $disk->path($target));
    }

    private function disk(): Filesystem
    {
        return Storage::disk('public');
    }
}
