<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicTestimonialResource;
use App\Models\Testimonial;
use App\Support\PublicContentCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioTestimonialController extends Controller
{
    private const MAX_PER_PAGE = 50;

    /**
     * Published letters, newest first.
     */
    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(self::MAX_PER_PAGE, max(1, (int) $request->query('perPage', 12)));

        $payload = PublicContentCache::remember(
            PublicContentCache::TESTIMONIALS,
            "page:{$page}:per:{$perPage}",
            900,
            function () use ($page, $perPage, $request): array {
                $paginator = Testimonial::query()
                    ->published()
                    ->orderByDesc('published_at')
                    ->orderByDesc('id')
                    ->paginate($perPage, page: $page);

                return [
                    'items' => PublicTestimonialResource::collection($paginator->items())->resolve($request),
                    'totalCount' => $paginator->total(),
                    'page' => $paginator->currentPage(),
                    'perPage' => $paginator->perPage(),
                ];
            },
        );

        return response()->json($payload);
    }
}
