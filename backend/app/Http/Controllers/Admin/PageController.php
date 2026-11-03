<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Page\PageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    use RespondsWithPagination;

    private const SORTS = ['id', 'title', 'slug', 'active', 'updated_at'];

    public function __construct()
    {
        $this->authorizeResource(Page::class, 'page');
        $this->middleware('permission:pages.viewAny')->only('index');
        $this->middleware('permission:pages.view')->only('show');
        $this->middleware('permission:pages.create')->only('store');
        $this->middleware('permission:pages.update')->only('update');
        $this->middleware('permission:pages.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = Page::query();

        if (in_array($kind = $request->query('kind'), Page::KINDS, true)) {
            $query->where('kind', $kind);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(fn ($builder) => $builder
                ->where('title', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%"));
        }

        $sortBy = Str::snake((string) $request->query('sortBy', 'title'));
        $direction = $request->query('sortDirection', 'asc') === 'desc' ? 'desc' : 'asc';

        $paginator = $query
            ->orderBy(in_array($sortBy, self::SORTS, true) ? $sortBy : 'title', $direction)
            ->orderBy('id')
            ->paginate(min(100, max(1, (int) $request->query('perPage', 25))));

        return $this->paginated(PageResource::class, $paginator);
    }

    public function store(PageRequest $request)
    {
        return new PageResource(Page::query()->create($request->validated()));
    }

    public function show(Page $page)
    {
        return new PageResource($page);
    }

    public function update(PageRequest $request, Page $page)
    {
        $page->update($request->validated());

        return new PageResource($page->refresh());
    }

    public function destroy(Page $page)
    {
        $page->delete();

        return response()->noContent();
    }
}
