<?php

namespace App\Http\Controllers;

use App\Http\Resources\PortfolioPublicCountryOptionResource;
use App\Http\Resources\PortfolioPublicFilterChipResource;
use App\Support\PortfolioOfferQuery;
use App\Support\PublicContentCache;
use Illuminate\Http\Request;

class PortfolioFilterChipController extends Controller
{
    public function offerFilters(Request $request)
    {
        $payload = PublicContentCache::remember(
            PublicContentCache::PORTFOLIO_FILTERS,
            'all:'.PublicContentCache::fingerprint($request->query()),
            600,
            fn () => PortfolioPublicFilterChipResource::collection(
                collect(PortfolioOfferQuery::buildPublicChipPayload($request, null))
            )->resolve($request)
        );

        return response()->json($payload);
    }

    public function offerCountries(Request $request)
    {
        $payload = PublicContentCache::remember(
            PublicContentCache::PORTFOLIO_COUNTRIES,
            'all:'.PublicContentCache::fingerprint($request->query()),
            600,
            fn () => PortfolioPublicCountryOptionResource::collection(
                collect(PortfolioOfferQuery::buildPublicCountryPayload($request, null))
            )->resolve($request)
        );

        return response()->json($payload);
    }

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

    public function categoryCountries(Request $request, string $slug)
    {
        $payload = PublicContentCache::remember(
            PublicContentCache::PORTFOLIO_COUNTRIES,
            "{$slug}:".PublicContentCache::fingerprint($request->query()),
            600,
            fn () => PortfolioPublicCountryOptionResource::collection(
                collect(PortfolioOfferQuery::buildPublicCountryPayload($request, $slug))
            )->resolve($request)
        );

        return response()->json($payload);
    }
}
