<?php

namespace App\Http\Controllers;

use App\Http\Resources\PortfolioPublicFilterChipResource;
use App\Support\PortfolioOfferQuery;
use Illuminate\Http\Request;

class PortfolioFilterChipController extends Controller
{
    public function categoryFilters(Request $request, string $slug)
    {
        return response()->json(
            PortfolioPublicFilterChipResource::collection(
                collect(PortfolioOfferQuery::buildPublicChipPayload($request, $slug))
            )->resolve($request)
        );
    }
}
