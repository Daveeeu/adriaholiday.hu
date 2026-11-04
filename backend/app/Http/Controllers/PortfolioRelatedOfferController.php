<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\PortfolioRelatedOffersRequest;
use App\Http\Resources\PortfolioFeaturedTourResource;
use App\Models\Tour;
use App\Services\Tour\RelatedTourRecommender;
use App\Support\PublicContentCache;
use Illuminate\Http\JsonResponse;

/**
 * The offers the trip page recommends under "Ezek is érdekelhetnek" (see
 * RelatedTourRecommender), as offer cards. Without earlier views the answer
 * is the same for every visitor, so it is cached.
 */
class PortfolioRelatedOfferController extends Controller
{
    private const LIMIT = 6;

    public function __invoke(PortfolioRelatedOffersRequest $request, RelatedTourRecommender $recommender, string $slug): JsonResponse
    {
        $tour = Tour::query()->where('active', true)->where('seo_name', $slug)->first();

        if ($tour === null) {
            return response()->json(['message' => 'Az ajánlat nem található.'], 404);
        }

        $viewed = $request->viewedSlugs();
        $items = fn (): array => PortfolioFeaturedTourResource::collection($recommender->recommend($tour, $viewed, self::LIMIT))->resolve($request);

        return response()->json([
            'items' => $viewed === []
                ? PublicContentCache::remember(PublicContentCache::OFFERS, "related:{$tour->id}", 3600, $items)
                : $items(),
        ]);
    }
}
