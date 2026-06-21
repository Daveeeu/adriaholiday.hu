<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Blog\StoreBlogCategoryRequest;
use App\Http\Requests\Admin\Blog\UpdateBlogCategoryRequest;
use App\Http\Resources\BlogCategoryResource;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BlogCategoryController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(BlogCategory::class, 'blogCategory');
        $this->middleware('permission:blog-categories.viewAny')->only('index');
        $this->middleware('permission:blog-categories.view')->only('show');
        $this->middleware('permission:blog-categories.create')->only('store');
        $this->middleware('permission:blog-categories.update')->only('update');
        $this->middleware('permission:blog-categories.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = BlogCategory::query()->with('translations');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('seo_name', 'like', "%{$search}%")
                    ->orWhereHas('translations', function ($translationQuery) use ($search): void {
                        $translationQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('seo_name', 'like', "%{$search}%");
                    });
            });
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'sort_order')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));
        $allowedSorts = ['id', 'name', 'column', 'seo_name', 'sort_order', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        $direction = $sortDirection === 'desc' ? 'desc' : 'asc';
        if ($sortBy === 'name') {
            $query->orderByRaw(
                "(select name from blog_category_translations where blog_category_translations.blog_category_id = blog_categories.id and locale = 'hu' limit 1) {$direction}"
            );
        } else {
            $query->orderBy($sortBy, $direction);
        }

        $paginator = $query->paginate($perPage);

        return $this->paginated(BlogCategoryResource::class, $paginator);
    }

    public function store(StoreBlogCategoryRequest $request)
    {
        $validated = $request->validated();

        $category = DB::transaction(function () use ($validated): BlogCategory {
            $category = BlogCategory::create([
                'active' => $validated['active'] ?? true,
                'column' => $validated['column'],
                'sort_order' => $validated['sort_order'] ?? 0,
                'seo_name' => $validated['translations']['hu']['seo_name'],
            ]);

            $this->syncTranslations($category, $validated['translations']);

            return $category;
        });

        return new BlogCategoryResource($category->load('translations'));
    }

    public function show(BlogCategory $blogCategory)
    {
        return new BlogCategoryResource($blogCategory->load('translations'));
    }

    public function update(UpdateBlogCategoryRequest $request, BlogCategory $blogCategory)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($blogCategory, $validated): void {
            $blogCategory->update([
                'active' => $validated['active'] ?? true,
                'column' => $validated['column'],
                'sort_order' => $validated['sort_order'] ?? 0,
                'seo_name' => $validated['translations']['hu']['seo_name'],
            ]);

            $this->syncTranslations($blogCategory, $validated['translations']);
        });

        return new BlogCategoryResource($blogCategory->refresh()->load('translations'));
    }

    public function destroy(BlogCategory $blogCategory)
    {
        $blogCategory->delete();

        return response()->noContent();
    }

    /**
     * @param array<string, array<string, mixed>> $translations
     */
    private function syncTranslations(BlogCategory $category, array $translations): void
    {
        foreach ($translations as $locale => $translation) {
            $category->translations()->updateOrCreate(
                ['locale' => $locale],
                [
                    'name' => $translation['name'],
                    'seo_name' => $translation['seo_name'],
                    'seo_auto_generate' => (bool) ($translation['seo_auto_generate'] ?? true),
                ],
            );
        }
    }
}
