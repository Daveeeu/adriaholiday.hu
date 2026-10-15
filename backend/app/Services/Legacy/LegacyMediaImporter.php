<?php

namespace App\Services\Legacy;

use App\Models\LegacyMediaFile;
use App\Support\MediaCategory;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Imports one legacy image into the shared media library for the page
 * importers (tours, blog), through LegacyMediaMirror: an image copied before
 * (same URL, or same content) is reused instead of stored again.
 */
class LegacyMediaImporter
{
    public function __construct(private readonly LegacyMediaMirror $mirror = new LegacyMediaMirror) {}

    /**
     * Number of images actually downloaded (not reused) since this instance was created.
     */
    public function downloadCount(): int
    {
        return $this->mirror->downloadCount();
    }

    /**
     * @param  array{alt?: ?string, title?: ?string, caption?: ?string, category?: MediaCategory}  $meta  category defaults to tours
     *
     * @throws LegacyFetchException
     */
    public function importImage(string $absoluteUrl, array $meta = []): Media
    {
        $file = $this->mirror->mirror($absoluteUrl, $meta);

        if ($file->status !== LegacyMediaFile::MIRRORED || $file->media === null) {
            throw new LegacyFetchException($file->error ?? "Failed to download image {$absoluteUrl}");
        }

        return $file->media;
    }
}
