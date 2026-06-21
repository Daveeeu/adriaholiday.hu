<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Location\StoreLocationRequest;
use App\Http\Requests\Admin\Location\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LocationController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(Location::class, 'location');
        $this->middleware('permission:locations.viewAny')->only('index');
        $this->middleware('permission:locations.view')->only('show');
        $this->middleware('permission:locations.create')->only('store');
        $this->middleware('permission:locations.update')->only('update');
        $this->middleware('permission:locations.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = Location::query()->with('region');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'sort_order')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));
        $allowedSorts = ['id', 'slug', 'name', 'type', 'featured', 'is_active', 'sort_order', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage);

        return $this->paginated(LocationResource::class, $paginator);
    }

    public function store(StoreLocationRequest $request)
    {
        $location = Location::create($request->validated());

        return new LocationResource($location->load('region'));
    }

    public function show(Location $location)
    {
        return new LocationResource($location->load('region'));
    }

    public function update(UpdateLocationRequest $request, Location $location)
    {
        $location->update($request->validated());

        return new LocationResource($location->refresh()->load('region'));
    }

    public function destroy(Location $location)
    {
        $location->delete();

        return response()->noContent();
    }
}
