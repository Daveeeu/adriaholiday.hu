<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Region\StoreRegionRequest;
use App\Http\Requests\Admin\Region\UpdateRegionRequest;
use App\Http\Resources\RegionResource;
use App\Models\Region;
use App\Support\PublicContentCache;
use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RegionController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(Region::class, 'region');
        $this->middleware('permission:regions.viewAny')->only('index');
        $this->middleware('permission:regions.view')->only('show');
        $this->middleware('permission:regions.create')->only('store');
        $this->middleware('permission:regions.update')->only('update');
        $this->middleware('permission:regions.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = Region::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('country_code', 'like', "%{$search}%");
            });
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'sort_order')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));

        $allowedSorts = ['id', 'slug', 'name', 'country_code', 'is_active', 'sort_order', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage);

        return $this->paginated(RegionResource::class, $paginator);
    }

    public function store(StoreRegionRequest $request)
    {
        $validated = $request->validated();
        $validated['summary'] = RichTextSanitizer::sanitize($validated['summary'] ?? null);
        $validated['description'] = RichTextSanitizer::sanitize($validated['description'] ?? null);
        $validated['portfolio_short_description'] = RichTextSanitizer::sanitize($validated['portfolio_short_description'] ?? null);

        $region = Region::create($validated);

        PublicContentCache::bump(PublicContentCache::REGIONS, PublicContentCache::OFFERS, PublicContentCache::SITEMAP);

        return new RegionResource($region);
    }

    public function show(Region $region)
    {
        return new RegionResource($region);
    }

    public function update(UpdateRegionRequest $request, Region $region)
    {
        $validated = $request->validated();
        $validated['summary'] = RichTextSanitizer::sanitize($validated['summary'] ?? null);
        $validated['description'] = RichTextSanitizer::sanitize($validated['description'] ?? null);
        $validated['portfolio_short_description'] = RichTextSanitizer::sanitize($validated['portfolio_short_description'] ?? null);

        $region->update($validated);

        PublicContentCache::bump(PublicContentCache::REGIONS, PublicContentCache::OFFERS, PublicContentCache::SITEMAP);

        return new RegionResource($region->refresh());
    }

    public function destroy(Region $region)
    {
        $region->delete();

        PublicContentCache::bump(PublicContentCache::REGIONS, PublicContentCache::OFFERS, PublicContentCache::SITEMAP);

        return response()->noContent();
    }
}
