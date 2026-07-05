<?php

namespace App\Http\Controllers;

use App\Http\Resources\PortfolioFeaturedTourResource;
use App\Http\Resources\PortfolioOfferDetailResource;
use App\Models\Region;
use App\Models\Tour;
use App\Support\PortfolioOfferQuery;
use App\Support\PublicContentCache;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PortfolioOfferController extends Controller
{
    public function index(Request $request)
    {
        return $this->cachedPaginatedResponse($request, 'index', PortfolioOfferQuery::buildBaseQuery($request));
    }

    public function categoryOffers(Request $request, string $slug)
    {
        $query = PortfolioOfferQuery::buildBaseQuery($request);
        PortfolioOfferQuery::applyCategoryScope($query, $slug);
        PortfolioOfferQuery::applyRequestChipFilters($query, $request, $slug);

        return $this->cachedPaginatedResponse($request, "category:{$slug}", $query, function () use ($request, $slug): array {
            $recommendedQuery = PortfolioOfferQuery::buildBaseQuery(new Request);
            PortfolioOfferQuery::applyCategoryScope($recommendedQuery, $slug);

            return $this->recommendedItems($request, $recommendedQuery);
        });
    }

    public function regionOffers(Request $request, string $slug)
    {
        $query = PortfolioOfferQuery::buildBaseQuery($request);
        $regionExists = Region::query()->where('slug', $slug)->exists();

        if ($regionExists) {
            $query->whereHas('region', fn (Builder $regionQuery) => $regionQuery->where('slug', $slug));
        }

        return $this->cachedPaginatedResponse($request, "region:{$slug}", $query);
    }

    public function show(string $slug)
    {
        $tour = Tour::query()
            ->where('active', true)
            ->where('seo_name', $slug)
            ->with(['region', 'dates', 'partnerBonuses', 'departurePlaces', 'media', 'priceItems', 'programDays', 'galleryItems.media'])
            ->first();

        if (! $tour) {
            return response()->json([
                'message' => 'Az ajánlat nem található.',
            ], 404);
        }

        return response()->json((new PortfolioOfferDetailResource($tour))->resolve(request()));
    }

    private function cachedPaginatedResponse(Request $request, string $keyPrefix, Builder $query, ?callable $recommendedResolver = null)
    {
        $suffix = $keyPrefix.':'.PublicContentCache::fingerprint($request->query());

        $payload = PublicContentCache::remember(
            PublicContentCache::OFFERS,
            $suffix,
            300,
            fn () => $this->buildPaginatedPayload($request, $query, $recommendedResolver)
        );

        return response()->json($payload);
    }

    private function buildPaginatedPayload(Request $request, Builder $query, ?callable $recommendedResolver): array
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = (int) $request->query('perPage', $request->query('per_page', 12));
        $perPage = max(1, min(24, $perPage));

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);
        $recommended = [];

        if ($recommendedResolver !== null && $paginator->count() > 0) {
            $recommended = $recommendedResolver();
        }

        return [
            'items' => PortfolioFeaturedTourResource::collection($paginator->getCollection())->resolve($request),
            'totalCount' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'perPage' => $paginator->perPage(),
            'recommended' => $recommended,
        ];
    }

    private function recommendedItems(Request $request, Builder $query): array
    {
        $items = $query
            ->orderByDesc('featured')
            ->orderByDesc('recommended')
            ->orderBy('sort_order')
            ->orderByRaw('case when price is null then 1 else 0 end asc')
            ->orderBy('price')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get();

        return PortfolioFeaturedTourResource::collection($items)->resolve($request);
    }
}
