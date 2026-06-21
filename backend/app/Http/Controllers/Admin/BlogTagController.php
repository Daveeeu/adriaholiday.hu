<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Blog\StoreBlogTagRequest;
use App\Http\Requests\Admin\Blog\UpdateBlogTagRequest;
use App\Http\Resources\BlogTagResource;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BlogTagController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(BlogTag::class, 'blogTag');
        $this->middleware('permission:blog-tags.viewAny')->only('index');
        $this->middleware('permission:blog-tags.view')->only('show');
        $this->middleware('permission:blog-tags.create')->only('store');
        $this->middleware('permission:blog-tags.update')->only('update');
        $this->middleware('permission:blog-tags.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = BlogTag::query()->with('translations');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->whereHas('translations', function ($translationQuery) use ($search): void {
                $translationQuery->where('name', 'like', "%{$search}%");
            });
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'sort_order')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));
        $allowedSorts = ['id', 'name', 'sort_order', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        $direction = $sortDirection === 'desc' ? 'desc' : 'asc';
        if ($sortBy === 'name') {
            $query->orderByRaw(
                "(select name from blog_tag_translations where blog_tag_translations.blog_tag_id = blog_tags.id and locale = 'hu' limit 1) {$direction}"
            );
        } else {
            $query->orderBy($sortBy, $direction);
        }

        $paginator = $query->paginate($perPage);

        return $this->paginated(BlogTagResource::class, $paginator);
    }

    public function store(StoreBlogTagRequest $request)
    {
        $validated = $request->validated();

        $tag = DB::transaction(function () use ($validated): BlogTag {
            $tag = BlogTag::create([
                'active' => $validated['active'] ?? true,
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            $this->syncTranslations($tag, $validated['translations']);

            return $tag;
        });

        return new BlogTagResource($tag->load('translations'));
    }

    public function show(BlogTag $blogTag)
    {
        return new BlogTagResource($blogTag->load('translations'));
    }

    public function update(UpdateBlogTagRequest $request, BlogTag $blogTag)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($blogTag, $validated): void {
            $blogTag->update([
                'active' => $validated['active'] ?? true,
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            $this->syncTranslations($blogTag, $validated['translations']);
        });

        return new BlogTagResource($blogTag->refresh()->load('translations'));
    }

    public function destroy(BlogTag $blogTag)
    {
        $blogTag->delete();

        return response()->noContent();
    }

    /**
     * @param array<string, array<string, mixed>> $translations
     */
    private function syncTranslations(BlogTag $tag, array $translations): void
    {
        foreach ($translations as $locale => $translation) {
            $tag->translations()->updateOrCreate(
                ['locale' => $locale],
                [
                    'name' => $translation['name'],
                ],
            );
        }
    }
}
