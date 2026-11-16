<?php

namespace App\Support;

use App\Services\Media\WebImageOptimizer;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

/**
 * Validation rules for a file uploaded to the media library.
 *
 * A JPEG, PNG or WebP photo may be large (a camera original), since
 * WebImageOptimizer stores it as a web-sized WebP; any other file must fit
 * the media library's own size limit as it is.
 */
final class MediaUploadRules
{
    /**
     * @param  list<string>  $mimeTypes
     * @return list<mixed>
     */
    public static function file(array $mimeTypes, mixed $file): array
    {
        $rules = ['required', 'file', 'mimetypes:'.implode(',', $mimeTypes)];

        if ($file instanceof UploadedFile && app(WebImageOptimizer::class)->isConvertible($file->getMimeType())) {
            return [
                ...$rules,
                'max:'.WebImageOptimizer::MAX_UPLOAD_KILOBYTES,
                Rule::dimensions()
                    ->maxWidth(WebImageOptimizer::MAX_UPLOAD_DIMENSION)
                    ->maxHeight(WebImageOptimizer::MAX_UPLOAD_DIMENSION),
            ];
        }

        return [...$rules, 'max:'.intdiv((int) config('media-library.max_file_size'), 1024)];
    }
}
