<?php

namespace App\Http\Controllers;

use App\Services\Media\ResizedImageService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ResizedImageController extends Controller
{
    public function __invoke(ResizedImageService $images, int $width, string $path): BinaryFileResponse
    {
        $file = $images->resolve($width, $path);

        abort_if($file === null, 404);

        return response()->file($file, [
            'Content-Type' => 'image/webp',
            'Cache-Control' => 'public, max-age=2592000',
        ]);
    }
}
