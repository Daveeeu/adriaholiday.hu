<?php

namespace Tests\Concerns;

use GdImage;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

/**
 * Answers every HTTP request with a small PNG of its own per URL, as the
 * legacy site would serve distinct photos (the media mirror stores a file
 * whose content it already has only once).
 */
trait FakesLegacyImages
{
    /**
     * Legacy file URLs the fake answers with 404, changeable during a test.
     *
     * @var array<int, string>
     */
    protected array $missingLegacyImages = [];

    protected function fakeLegacyImages(): void
    {
        Http::fake(function (Request $request) {
            if (in_array($request->url(), $this->missingLegacyImages, true)) {
                return Http::response('', 404);
            }

            return Http::response($request->method() === 'HEAD' ? '' : self::pngFor($request->url()), 200, ['Content-Type' => 'image/png']);
        });
    }

    protected static function pngFor(string $url): string
    {
        /** @var GdImage $image */
        $image = imagecreatetruecolor(2, 2);
        $hash = crc32($url);
        imagefill($image, 0, 0, imagecolorallocate($image, $hash & 0xFF, ($hash >> 8) & 0xFF, ($hash >> 16) & 0xFF));
        imagesetpixel($image, 1, 1, imagecolorallocate($image, ($hash >> 24) & 0xFF, 7, 11));

        ob_start();
        imagepng($image);

        return (string) ob_get_clean();
    }
}
