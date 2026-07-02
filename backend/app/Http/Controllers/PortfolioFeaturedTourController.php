<?php

namespace App\Http\Controllers;

use App\Http\Resources\PortfolioFeaturedTourResource;
use App\Models\Tour;
use Illuminate\Http\Request;

class PortfolioFeaturedTourController extends Controller
{
    public function index(Request $request)
    {
        $limit = max(1, min(6, (int) $request->query('limit', 6)));

        $tours = Tour::query()
            ->where('active', true)
            ->where('featured', true)
            ->with(['region', 'dates', 'media'])
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return response()->json([
            'items' => PortfolioFeaturedTourResource::collection($tours)->resolve($request),
        ]);
    }
}
