<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicPageResource;
use App\Models\Page;
use App\Support\PublicContentCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioPageController extends Controller
{
    /**
     * A published text page by its address.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $payload = PublicContentCache::remember(
            PublicContentCache::PAGES,
            'detail:'.md5($slug),
            900,
            function () use ($slug, $request): ?array {
                $page = Page::query()->published()->where('slug', $slug)->first();

                return $page !== null ? (new PublicPageResource($page))->resolve($request) : null;
            },
        );

        abort_if($payload === null, 404);

        return response()->json($payload);
    }
}
