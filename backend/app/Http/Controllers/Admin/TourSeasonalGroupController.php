<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Tour\StoreTourSeasonalGroupRequest;
use App\Http\Requests\Admin\Tour\UpdateTourSeasonalGroupRequest;
use App\Http\Requests\Admin\Tour\UpdateTourSeasonalGroupStatusRequest;
use App\Http\Resources\TourSeasonalGroupResource;
use App\Models\TourSeasonalGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TourSeasonalGroupController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(TourSeasonalGroup::class, 'tourSeasonalGroup');
        $this->middleware('permission:tour-seasonal-groups.viewAny')->only('index');
        $this->middleware('permission:tour-seasonal-groups.view')->only('show');
        $this->middleware('permission:tour-seasonal-groups.create')->only('store');
        $this->middleware('permission:tour-seasonal-groups.update')->only('update');
        $this->middleware('permission:tour-seasonal-groups.delete')->only('destroy');
        $this->middleware('permission:tour-seasonal-groups.status')->only('status');
    }

    public function index(Request $request)
    {
        $query = TourSeasonalGroup::query()->withCount('tours');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('seo_name', 'like', "%{$search}%")
                    ->orWhere('menu_type', 'like', "%{$search}%")
                    ->orWhere('box_text', 'like', "%{$search}%");
            });
        }

        if ($request->query('active') !== null) {
            $query->where('active', filter_var($request->query('active'), FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'name')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));
        $allowedSorts = ['id', 'name', 'menu_type', 'active', 'has_offers', 'seo_name', 'seo_auto_generate', 'related_tours_count', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'name';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage);

        return $this->paginated(TourSeasonalGroupResource::class, $paginator);
    }

    public function store(StoreTourSeasonalGroupRequest $request)
    {
        $group = DB::transaction(fn () => TourSeasonalGroup::create($request->validated()));

        return new TourSeasonalGroupResource($group->loadCount('tours'));
    }

    public function show(TourSeasonalGroup $tourSeasonalGroup)
    {
        return new TourSeasonalGroupResource($tourSeasonalGroup->loadCount('tours'));
    }

    public function update(UpdateTourSeasonalGroupRequest $request, TourSeasonalGroup $tourSeasonalGroup)
    {
        $tourSeasonalGroup->update($request->validated());

        return new TourSeasonalGroupResource($tourSeasonalGroup->refresh()->loadCount('tours'));
    }

    public function destroy(TourSeasonalGroup $tourSeasonalGroup)
    {
        $tourSeasonalGroup->delete();

        return response()->noContent();
    }

    public function status(UpdateTourSeasonalGroupStatusRequest $request, TourSeasonalGroup $tourSeasonalGroup)
    {
        $this->authorize('status', $tourSeasonalGroup);

        $tourSeasonalGroup->update(['active' => $request->validated()['active']]);

        return new TourSeasonalGroupResource($tourSeasonalGroup->refresh()->loadCount('tours'));
    }
}
