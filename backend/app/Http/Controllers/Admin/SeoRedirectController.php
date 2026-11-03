<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SeoRedirect\SeoRedirectRequest;
use App\Http\Resources\SeoRedirectResource;
use App\Models\SeoRedirect;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SeoRedirectController extends Controller
{
    use RespondsWithPagination;

    private const SORTS = ['id', 'source_path', 'target', 'hits', 'last_hit_at', 'active', 'origin', 'created_at'];

    public function __construct()
    {
        $this->authorizeResource(SeoRedirect::class, 'seoRedirect');
        $this->middleware('permission:seo-redirects.viewAny')->only('index');
        $this->middleware('permission:seo-redirects.view')->only('show');
        $this->middleware('permission:seo-redirects.create')->only('store');
        $this->middleware('permission:seo-redirects.update')->only('update');
        $this->middleware('permission:seo-redirects.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = SeoRedirect::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $path = SeoRedirect::normalizePath($search);
            $query->where(fn ($builder) => $builder
                ->where('source_path', 'like', "%{$path}%")
                ->orWhere('target', 'like', "%{$search}%"));
        }

        if (in_array($origin = $request->query('origin'), [SeoRedirect::ORIGIN_LEGACY, SeoRedirect::ORIGIN_MANUAL], true)) {
            $query->where('origin', $origin);
        }

        $sortBy = Str::snake((string) $request->query('sortBy', 'hits'));
        $direction = $request->query('sortDirection', 'desc') === 'asc' ? 'asc' : 'desc';

        $paginator = $query
            ->orderBy(in_array($sortBy, self::SORTS, true) ? $sortBy : 'hits', $direction)
            ->orderByDesc('id')
            ->paginate(min(100, max(1, (int) $request->query('perPage', 25))));

        return $this->paginated(SeoRedirectResource::class, $paginator);
    }

    public function store(SeoRedirectRequest $request)
    {
        return new SeoRedirectResource(SeoRedirect::query()->create([...$request->validated(), 'origin' => SeoRedirect::ORIGIN_MANUAL]));
    }

    public function show(SeoRedirect $seoRedirect)
    {
        return new SeoRedirectResource($seoRedirect);
    }

    /**
     * An edited redirect becomes the office's own: a later legacy import
     * leaves it as it is.
     */
    public function update(SeoRedirectRequest $request, SeoRedirect $seoRedirect)
    {
        $seoRedirect->update([...$request->validated(), 'origin' => SeoRedirect::ORIGIN_MANUAL]);

        return new SeoRedirectResource($seoRedirect->refresh());
    }

    public function destroy(SeoRedirect $seoRedirect)
    {
        $seoRedirect->delete();

        return response()->noContent();
    }
}
