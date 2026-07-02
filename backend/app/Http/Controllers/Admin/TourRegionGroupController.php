<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Tour\StoreTourRegionGroupRequest;
use App\Http\Requests\Admin\Tour\UpdateTourRegionGroupRequest;
use App\Http\Requests\Admin\Tour\UpdateTourRegionGroupStatusRequest;
use App\Http\Resources\TourRegionGroupResource;
use App\Models\TourRegionGroup;
use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TourRegionGroupController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(TourRegionGroup::class, 'tourRegionGroup');
        $this->middleware('permission:tour-region-groups.viewAny')->only('index');
        $this->middleware('permission:tour-region-groups.view')->only('show');
        $this->middleware('permission:tour-region-groups.create')->only('store');
        $this->middleware('permission:tour-region-groups.update')->only('update');
        $this->middleware('permission:tour-region-groups.delete')->only('destroy');
        $this->middleware('permission:tour-region-groups.status')->only('status');
    }

    public function index(Request $request)
    {
        $query = TourRegionGroup::query()->with(['gallery'])->withCount('tours');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('seo_name', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->query('active') !== null) {
            $query->where('active', filter_var($request->query('active'), FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'name')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));
        $allowedSorts = ['id', 'name', 'type', 'active', 'featured_on_homepage', 'seo_name', 'seo_auto_generate', 'related_tours_count', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'name';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage);

        return $this->paginated(TourRegionGroupResource::class, $paginator);
    }

    public function store(StoreTourRegionGroupRequest $request)
    {
        $validated = $request->validated();
        $validated['description'] = RichTextSanitizer::sanitize($validated['description'] ?? null);
        $validated['list_below_text'] = RichTextSanitizer::sanitize($validated['list_below_text'] ?? null);

        $group = DB::transaction(fn () => TourRegionGroup::create($validated));

        return new TourRegionGroupResource($group->load(['gallery'])->loadCount('tours'));
    }

    public function show(TourRegionGroup $tourRegionGroup)
    {
        return new TourRegionGroupResource($tourRegionGroup->load(['gallery'])->loadCount('tours'));
    }

    public function update(UpdateTourRegionGroupRequest $request, TourRegionGroup $tourRegionGroup)
    {
        $validated = $request->validated();
        $validated['description'] = RichTextSanitizer::sanitize($validated['description'] ?? null);
        $validated['list_below_text'] = RichTextSanitizer::sanitize($validated['list_below_text'] ?? null);

        $tourRegionGroup->update($validated);

        return new TourRegionGroupResource($tourRegionGroup->refresh()->load(['gallery'])->loadCount('tours'));
    }

    public function destroy(TourRegionGroup $tourRegionGroup)
    {
        $tourRegionGroup->delete();

        return response()->noContent();
    }

    public function status(UpdateTourRegionGroupStatusRequest $request, TourRegionGroup $tourRegionGroup)
    {
        $this->authorize('status', $tourRegionGroup);

        $tourRegionGroup->update(['active' => $request->validated()['active']]);

        return new TourRegionGroupResource($tourRegionGroup->refresh()->load(['gallery'])->loadCount('tours'));
    }
}
