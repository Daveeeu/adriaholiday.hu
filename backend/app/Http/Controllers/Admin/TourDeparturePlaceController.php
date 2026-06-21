<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Tour\StoreTourDeparturePlaceRequest;
use App\Http\Requests\Admin\Tour\UpdateTourDeparturePlaceRequest;
use App\Http\Requests\Admin\Tour\UpdateTourDeparturePlaceStatusRequest;
use App\Http\Resources\TourDeparturePlaceResource;
use App\Models\TourDeparturePlace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TourDeparturePlaceController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(TourDeparturePlace::class, 'tourDeparturePlace');
        $this->middleware('permission:tour-departure-places.viewAny')->only('index');
        $this->middleware('permission:tour-departure-places.view')->only('show');
        $this->middleware('permission:tour-departure-places.create')->only('store');
        $this->middleware('permission:tour-departure-places.update')->only('update');
        $this->middleware('permission:tour-departure-places.delete')->only('destroy');
        $this->middleware('permission:tour-departure-places.status')->only('status');
    }

    public function index(Request $request)
    {
        $query = TourDeparturePlace::query()->withCount('tours');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($request->query('active') !== null) {
            $query->where('active', filter_var($request->query('active'), FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'name')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));
        $allowedSorts = ['id', 'name', 'city', 'active', 'fee', 'travel_count', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'name';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage);

        return $this->paginated(TourDeparturePlaceResource::class, $paginator);
    }

    public function store(StoreTourDeparturePlaceRequest $request)
    {
        $place = DB::transaction(fn () => TourDeparturePlace::create($request->validated()));

        return new TourDeparturePlaceResource($place->loadCount('tours'));
    }

    public function show(TourDeparturePlace $tourDeparturePlace)
    {
        return new TourDeparturePlaceResource($tourDeparturePlace->loadCount('tours'));
    }

    public function update(UpdateTourDeparturePlaceRequest $request, TourDeparturePlace $tourDeparturePlace)
    {
        $tourDeparturePlace->update($request->validated());

        return new TourDeparturePlaceResource($tourDeparturePlace->refresh()->loadCount('tours'));
    }

    public function destroy(TourDeparturePlace $tourDeparturePlace)
    {
        $tourDeparturePlace->delete();

        return response()->noContent();
    }

    public function status(UpdateTourDeparturePlaceStatusRequest $request, TourDeparturePlace $tourDeparturePlace)
    {
        $this->authorize('status', $tourDeparturePlace);

        $tourDeparturePlace->update(['active' => $request->validated()['active']]);

        return new TourDeparturePlaceResource($tourDeparturePlace->refresh()->loadCount('tours'));
    }
}
