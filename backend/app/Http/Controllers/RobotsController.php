<?php

namespace App\Http\Controllers;

use App\Support\Seo\PublicSiteUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RobotsController extends Controller
{
    public function __invoke(Request $request): Response
    {
        // Only the canonical host may be crawled; staging and aliases are closed.
        // The public site loads its content from /api/portfolio in the browser: without
        // access to it crawlers render every page as an empty error state.
        $rules = PublicSiteUrl::isCanonicalHost($request)
            ? [
                'Allow: /',
                'Allow: /api/portfolio/',
                'Disallow: /admin',
                'Disallow: /api',
                'Disallow: /api/portfolio/offers/*/pdf',
                'Disallow: /fizetes/',
            ]
            : ['Disallow: /'];

        $body = implode("\n", [
            'User-agent: *',
            ...$rules,
            'Sitemap: '.PublicSiteUrl::to('/sitemap.xml'),
            '',
        ]);

        return response($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
