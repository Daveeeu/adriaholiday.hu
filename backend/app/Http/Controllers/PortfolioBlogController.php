<?php

namespace App\Http\Controllers;

use App\Http\Resources\PortfolioBlogArticleDetailResource;
use App\Http\Resources\PortfolioBlogArticleResource;
use App\Models\BlogArticle;
use App\Support\PublicContentCache;
use Illuminate\Http\Request;

class PortfolioBlogController extends Controller
{
    public function index(Request $request)
    {
        $limit = max(1, min(24, (int) $request->query('limit', 6)));
        $featuredOnly = filter_var($request->query('featuredOnly', true), FILTER_VALIDATE_BOOL);

        $articles = PublicContentCache::remember(
            PublicContentCache::BLOG,
            'list:'.$limit.':'.($featuredOnly ? 'featured' : 'all'),
            900,
            function () use ($featuredOnly, $limit) {
                $query = BlogArticle::query()
                    ->where('active', true)
                    ->whereNotNull('published_at')
                    ->with(['translations', 'categories.translations', 'tags.translations', 'media']);

                if ($featuredOnly) {
                    $query
                        ->where('portfolio_featured', true)
                        ->orderBy('portfolio_sort_order')
                        ->orderByDesc('published_at');
                } else {
                    $query
                        ->orderByDesc('show_on_homepage')
                        ->orderBy('sort_order')
                        ->orderByDesc('published_at');
                }

                return $query->limit($limit)->get();
            }
        );

        return response()->json(
            PortfolioBlogArticleResource::collection($articles)->resolve($request)
        );
    }

    public function show(string $slug, Request $request)
    {
        $article = PublicContentCache::remember(
            PublicContentCache::BLOG,
            "detail:{$slug}",
            900,
            fn () => BlogArticle::query()
                ->where('active', true)
                ->whereNotNull('published_at')
                ->whereHas('translations', fn ($query) => $query->where('seo_name', $slug))
                ->with(['translations', 'categories.translations', 'tags.translations', 'media'])
                ->first()
        );

        abort_if($article === null, 404);

        return response()->json(
            (new PortfolioBlogArticleDetailResource($article))->resolve($request)
        );
    }
}
