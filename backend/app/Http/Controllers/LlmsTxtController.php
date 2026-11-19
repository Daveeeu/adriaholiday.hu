<?php

namespace App\Http\Controllers;

use App\Services\Seo\PortfolioSeoResolver;
use App\Support\Seo\LlmsTxtRenderer;
use App\Support\Seo\PublicSiteUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * /llms.txt: the office and its offer summarized for AI assistants, built
 * from the home page's crawlable content. Hosts other than the canonical
 * one answer 404, as they are never to be indexed.
 */
class LlmsTxtController extends Controller
{
    public function __invoke(Request $request, PortfolioSeoResolver $seo, LlmsTxtRenderer $renderer): Response
    {
        abort_unless(PublicSiteUrl::isCanonicalHost($request), 404);

        return response($renderer->render($seo->resolve('/'), $seo->siteName()), 200, [
            'Content-Type' => 'text/markdown; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
