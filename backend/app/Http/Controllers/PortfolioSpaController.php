<?php

namespace App\Http\Controllers;

use App\Services\Payment\Barion\BarionPixel;
use App\Services\Seo\PortfolioSeoResolver;
use App\Support\Seo\PublicSiteUrl;
use App\Support\Seo\SeoHeadRenderer;
use App\Support\Seo\SeoPage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Throwable;

/**
 * Serves the public site's single-page app for every non-API path, with the
 * page's own SEO head (title, description, canonical, Open Graph, structured
 * data) and status code, and the Base Barion Pixel when a pixel id is set.
 */
class PortfolioSpaController extends Controller
{
    private const FALLBACK_SITE_NAME = 'Adria Holiday';

    private const RESERVED_PATHS = [
        'api/*',
        'admin/assets/*',
        'portfolio/assets/*',
        'storage/*',
        'favicon.ico',
        'robots.txt',
        'sitemap.xml',
    ];

    public function __invoke(
        Request $request,
        BarionPixel $barionPixel,
        PortfolioSeoResolver $seo,
        SeoHeadRenderer $head,
    ): Response|RedirectResponse {
        abort_if($request->is(...self::RESERVED_PATHS), 404);

        [$page, $siteName] = $this->seo($seo, $request);

        if ($page->redirectTo !== null) {
            return redirect($page->redirectTo, 301);
        }

        $indexable = PublicSiteUrl::isCanonicalHost($request);
        $html = $head->render((string) file_get_contents(public_path('portfolio/index.html')), $page, $siteName, $indexable);
        $pixel = $barionPixel->snippet();

        if ($pixel !== null) {
            $html = preg_replace('~</head>~i', $pixel."\n</head>", $html, 1) ?? $html;
        }

        $headers = [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-cache',
        ];

        if (! $indexable) {
            $headers['X-Robots-Tag'] = 'noindex, nofollow';
        }

        return response($html, $page->status, $headers);
    }

    /**
     * The page still loads when its SEO data cannot be looked up; it then gets
     * the site's generic head instead of an error.
     */
    /**
     * @return array{0: SeoPage, 1: string} the page's head data and the site name
     */
    private function seo(PortfolioSeoResolver $seo, Request $request): array
    {
        try {
            return [$seo->resolve($request->path()), $seo->siteName()];
        } catch (Throwable $exception) {
            report($exception);

            return [new SeoPage(self::FALLBACK_SITE_NAME, '', '/'.ltrim($request->path(), '/')), self::FALLBACK_SITE_NAME];
        }
    }
}
