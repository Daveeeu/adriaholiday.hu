<?php

namespace App\Services\Media;

use Illuminate\Http\UploadedFile;

/** A file ready for the media library, as WebImageOptimizer prepared it. */
final class OptimizedImage
{
    public function __construct(
        public readonly UploadedFile|string $file,
        public readonly string $fileName,
        /** Whether the file is a temporary conversion the media library may move away. */
        public readonly bool $converted,
        /** @var array{author?: string, copyright?: string, origin?: string} Embedded in the original. */
        public readonly array $rights,
    ) {}
}
