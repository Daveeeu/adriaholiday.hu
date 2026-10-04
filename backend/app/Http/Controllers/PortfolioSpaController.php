<?php

namespace App\Http\Controllers;

use App\Services\Payment\Barion\BarionPixel;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Serves the public site's single-page app for every non-API path, with the
 * Base Barion Pixel snippet added to its <head> when a pixel id is set.
 */
class PortfolioSpaController extends Controller
{
    private const RESERVED_PATHS = [
        'api/*',
        'admin/assets/*',
        'portfolio/assets/*',
        'storage/*',
        'favicon.ico',
        'robots.txt',
        'sitemap.xml',
    ];

    public function __invoke(Request $request, BarionPixel $barionPixel): Response
    {
        abort_if($request->is(...self::RESERVED_PATHS), 404);

        $html = (string) file_get_contents(public_path('portfolio/index.html'));
        $pixel = $barionPixel->snippet();

        if ($pixel !== null) {
            $html = preg_replace('~</head>~i', $pixel."\n</head>", $html, 1) ?? $html;
        }

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-cache',
        ]);
    }
}
