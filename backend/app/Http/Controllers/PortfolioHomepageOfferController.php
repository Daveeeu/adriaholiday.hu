<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicHomepageOfferResource;
use App\Models\HomepageOffer;
use App\Support\PortfolioCategoryLinks;
use App\Support\PublicContentCache;
use Illuminate\Http\Request;

class PortfolioHomepageOfferController extends Controller
{
    public function index(Request $request)
    {
        $offers = PublicContentCache::remember(
            PublicContentCache::CATEGORY_LIST,
            'homepage-offers',
            900,
            function () {
                $categorySlugs = PortfolioCategoryLinks::existingSlugs();

                // A card linking to a category that does not exist (yet) would lead to a 404.
                return HomepageOffer::query()
                    ->where('active', true)
                    ->with(['translations', 'media'])
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->get()
                    ->filter(fn (HomepageOffer $offer): bool => PortfolioCategoryLinks::leadsToPage($offer->link, $categorySlugs))
                    ->values();
            }
        );

        return response()->json([
            'items' => PublicHomepageOfferResource::collection($offers)->resolve($request),
        ]);
    }
}
