<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicHomepageOfferResource;
use App\Models\HomepageOffer;
use Illuminate\Http\Request;

class PortfolioHomepageOfferController extends Controller
{
    public function index(Request $request)
    {
        $offers = HomepageOffer::query()
            ->where('active', true)
            ->with(['translations', 'media'])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'items' => PublicHomepageOfferResource::collection($offers)->resolve($request),
        ]);
    }
}
