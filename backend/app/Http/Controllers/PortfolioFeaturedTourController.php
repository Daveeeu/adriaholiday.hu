<?php

namespace App\Http\Controllers;

use App\Http\Resources\PortfolioFeaturedTourResource;
use App\Models\Tour;
use Illuminate\Http\Request;

class PortfolioFeaturedTourController extends Controller
{
    /** The homepage lists every featured offer (the legacy site features about 15). */
    private const MAX_LIMIT = 24;

    public function index(Request $request)
    {
        $limit = max(1, min(self::MAX_LIMIT, (int) $request->query('limit', 6)));

        $tours = Tour::query()
            ->where('active', true)
            ->where('featured', true)
            ->with(['region', 'dates' => fn ($query) => $query->upcoming(), 'media', 'galleryItems.media'])
            // The admin's featured order first; tours without one after them.
            ->orderByRaw('featured_order is null')
            ->orderBy('featured_order')
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return response()->json([
            'items' => PortfolioFeaturedTourResource::collection($tours)->resolve($request),
        ]);
    }
}
