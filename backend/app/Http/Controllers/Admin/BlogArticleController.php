<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Blog\StoreBlogArticleRequest;
use App\Http\Requests\Admin\Blog\UpdateBlogArticleRequest;
use App\Http\Resources\BlogArticleDetailResource;
use App\Http\Resources\BlogArticleResource;
use App\Models\BlogArticle;
use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BlogArticleController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(BlogArticle::class, 'blogArticle');
        $this->middleware('permission:blog-articles.viewAny')->only('index');
        $this->middleware('permission:blog-articles.view')->only('show');
        $this->middleware('permission:blog-articles.create')->only('store');
        $this->middleware('permission:blog-articles.update')->only('update');
        $this->middleware('permission:blog-articles.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = BlogArticle::query()->with(['translations', 'categories', 'tags', 'media']);

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('image_title', 'like', "%{$search}%")
                    ->orWhereHas('translations', function ($translationQuery) use ($search): void {
                        $translationQuery->where('title', 'like', "%{$search}%")
                            ->orWhere('seo_name', 'like', "%{$search}%")
                            ->orWhere('excerpt', 'like', "%{$search}%")
                            ->orWhere('content', 'like', "%{$search}%");
                    });
            });
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'published_at')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'desc'));
        $allowedSorts = ['id', 'title', 'published_at', 'show_on_homepage', 'views', 'sort_order', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'published_at';
        }

        $direction = $sortDirection === 'asc' ? 'asc' : 'desc';
        if ($sortBy === 'title') {
            $query->orderByRaw(
                "(select title from blog_article_translations where blog_article_translations.blog_article_id = blog_articles.id and locale = 'hu' limit 1) {$direction}"
            );
        } else {
            $query->orderBy($sortBy, $direction);
        }

        $paginator = $query->paginate($perPage);

        return $this->paginated(BlogArticleResource::class, $paginator);
    }

    public function store(StoreBlogArticleRequest $request)
    {
        $validated = $request->validated();

        $article = DB::transaction(function () use ($validated): BlogArticle {
            $article = BlogArticle::create([
                'active' => $validated['active'] ?? true,
                'published_at' => $validated['published_at'],
                'show_on_homepage' => $validated['show_on_homepage'] ?? false,
                'portfolio_featured' => $validated['portfolio_featured'] ?? false,
                'portfolio_sort_order' => $validated['portfolio_sort_order'] ?? 0,
                'image' => $validated['image'] ?? null,
                'image_title' => $validated['image_title'],
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            $this->syncTranslations($article, $validated['translations']);
            $article->categories()->sync($validated['category_ids']);
            $article->tags()->sync($validated['tag_ids'] ?? []);

            return $article;
        });

        return new BlogArticleDetailResource($article->load(['translations', 'categories.translations', 'tags.translations', 'media']));
    }

    public function show(BlogArticle $blogArticle)
    {
        return new BlogArticleDetailResource($blogArticle->load(['translations', 'categories.translations', 'tags.translations', 'media']));
    }

    public function update(UpdateBlogArticleRequest $request, BlogArticle $blogArticle)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($blogArticle, $validated): void {
            $blogArticle->update([
                'active' => $validated['active'] ?? true,
                'published_at' => $validated['published_at'],
                'show_on_homepage' => $validated['show_on_homepage'] ?? false,
                'portfolio_featured' => $validated['portfolio_featured'] ?? false,
                'portfolio_sort_order' => $validated['portfolio_sort_order'] ?? 0,
                'image' => $validated['image'] ?? null,
                'image_title' => $validated['image_title'],
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            $this->syncTranslations($blogArticle, $validated['translations']);
            $blogArticle->categories()->sync($validated['category_ids']);
            $blogArticle->tags()->sync($validated['tag_ids'] ?? []);
        });

        return new BlogArticleDetailResource($blogArticle->refresh()->load(['translations', 'categories.translations', 'tags.translations', 'media']));
    }

    public function destroy(BlogArticle $blogArticle)
    {
        $blogArticle->delete();

        return response()->noContent();
    }

    /**
     * @param array<string, array<string, mixed>> $translations
     */
    private function syncTranslations(BlogArticle $article, array $translations): void
    {
        foreach ($translations as $locale => $translation) {
            $article->translations()->updateOrCreate(
                ['locale' => $locale],
                [
                    'title' => $translation['title'],
                    'seo_name' => $translation['seo_name'],
                    'seo_auto_generate' => (bool) ($translation['seo_auto_generate'] ?? true),
                    'excerpt' => RichTextSanitizer::sanitize($translation['excerpt'] ?? null),
                    'content' => RichTextSanitizer::sanitize($translation['content'] ?? null),
                ],
            );
        }
    }
}
