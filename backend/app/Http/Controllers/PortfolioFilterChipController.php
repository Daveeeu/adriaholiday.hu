<?php

namespace App\Http\Controllers;

use App\Http\Resources\PortfolioPublicFilterChipResource;
use App\Support\PortfolioOfferQuery;
use App\Support\PublicContentCache;
use Illuminate\Http\Request;

class PortfolioFilterChipController extends Controller
{
    public function categoryFilters(Request $request, string $slug)
    {
        $payload = PublicContentCache::remember(
            PublicContentCache::PORTFOLIO_FILTERS,
            "{$slug}:".PublicContentCache::fingerprint($request->query()),
            600,
            fn () => PortfolioPublicFilterChipResource::collection(
                collect(PortfolioOfferQuery::buildPublicChipPayload($request, $slug))
            )->resolve($request)
        );

        return response()->json($payload);
    }
}
