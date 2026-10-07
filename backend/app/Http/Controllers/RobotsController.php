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
        $rules = PublicSiteUrl::isCanonicalHost($request)
            ? ['Allow: /', 'Disallow: /admin', 'Disallow: /api', 'Disallow: /fizetes/']
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
