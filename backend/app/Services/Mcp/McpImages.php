<?php

namespace App\Services\Mcp;

use App\Services\Media\ResizedImageService;
use Laravel\Mcp\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Images the AI assistant shows the staff member: photos from the media
 * library, sent as a web-sized WebP copy so a reply stays small, and the
 * admin user guide's screenshots.
 */
class McpImages
{
    /** Wide enough to recognise a place or read a screenshot, small enough for a chat. */
    public const WIDTH = 800;

    public function __construct(private readonly ResizedImageService $resizedImages) {}

    public function fromMedia(Media $media): ?Response
    {
        if ($media->disk !== 'public') {
            return null;
        }

        $path = $this->resizedImages->resolve(self::WIDTH, $media->getPathRelativeToRoot());

        return $path !== null ? $this->fromFile($path) : null;
    }

    public function fromGuide(string $file): ?Response
    {
        if (preg_match('/^[a-z0-9-]+$/', $file) !== 1) {
            return null;
        }

        return $this->fromFile(rtrim((string) config('mcp.guide_images_path'), '/')."/{$file}.webp");
    }

    private function fromFile(string $path): ?Response
    {
        if (! is_file($path) || ! is_readable($path)) {
            return null;
        }

        return Response::image((string) file_get_contents($path), 'image/webp');
    }
}
