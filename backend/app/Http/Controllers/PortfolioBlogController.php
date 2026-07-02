<?php

namespace App\Http\Controllers;

use App\Http\Resources\PortfolioBlogArticleDetailResource;
use App\Http\Resources\PortfolioBlogArticleResource;
use App\Models\BlogArticle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PortfolioBlogController extends Controller
{
    public function index(Request $request)
    {
        $limit = max(1, min(24, (int) $request->query('limit', 6)));
        $featuredOnly = filter_var($request->query('featuredOnly', true), FILTER_VALIDATE_BOOL);

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

        $articles = $query->limit($limit)->get();

        return response()->json(
            PortfolioBlogArticleResource::collection($articles)->resolve($request)
        );
    }

    public function show(string $slug, Request $request)
    {
        $article = BlogArticle::query()
            ->where('active', true)
            ->whereNotNull('published_at')
            ->with(['translations', 'categories.translations', 'tags.translations', 'media'])
            ->get()
            ->first(function (BlogArticle $article) use ($slug): bool {
                $translation = $article->translations->firstWhere('locale', 'hu')
                    ?? $article->translations->first();
                $articleSlug = $translation?->seo_name
                    ?: Str::slug((string) ($translation?->title ?? $article->image_title));

                return $articleSlug === $slug;
            });

        abort_if($article === null, 404);

        return response()->json(
            (new PortfolioBlogArticleDetailResource($article))->resolve($request)
        );
    }
}
