<?php

namespace App\Http\Controllers;

use App\Models\Region;
use Illuminate\Http\Request;

class PortfolioRegionController extends Controller
{
    public function index(Request $request)
    {
        $regions = Region::query()
            ->where('is_active', true)
            ->where('portfolio_featured', true)
            ->with('media')
            ->withCount([
                'apartments as apartments_count' => fn ($query) => $query->where('is_active', true),
            ])
            ->orderBy('portfolio_sort_order')
            ->orderBy('name')
            ->get()
            ->map(function (Region $region): array {
                $media = $region->getFirstMedia('portfolio-image');

                return [
                    'slug' => $region->slug,
                    'name' => $region->name,
                    'image' => $media?->getUrl() ?: $region->portfolio_image_url ?: $region->hero_image_url,
                    'imageMedia' => $media ? new \App\Http\Resources\MediaResource($media) : null,
                    'description' => $region->portfolio_short_description ?: $region->summary,
                    'apartmentCount' => (int) $region->apartments_count,
                    'portfolioFeatured' => (bool) $region->portfolio_featured,
                    'portfolioSortOrder' => (int) $region->portfolio_sort_order,
                ];
            })
            ->values();

        return response()->json($regions);
    }

    public function show(string $slug)
    {
        $region = Region::query()
            ->where('is_active', true)
            ->where('slug', $slug)
            ->with('media')
            ->withCount([
                'apartments as apartments_count' => fn ($query) => $query->where('is_active', true),
            ])
            ->firstOrFail();

        $media = $region->getFirstMedia('portfolio-image');

        return response()->json([
            'slug' => $region->slug,
            'name' => $region->name,
            'image' => $media?->getUrl() ?: $region->portfolio_image_url ?: $region->hero_image_url,
            'imageMedia' => $media ? new \App\Http\Resources\MediaResource($media) : null,
            'description' => $region->portfolio_short_description ?: $region->summary,
            'fullDescription' => $region->description,
            'apartmentCount' => (int) $region->apartments_count,
            'portfolioFeatured' => (bool) $region->portfolio_featured,
            'portfolioSortOrder' => (int) $region->portfolio_sort_order,
        ]);
    }
}
