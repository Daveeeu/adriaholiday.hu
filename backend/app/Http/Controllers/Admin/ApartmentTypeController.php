<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApartmentType\StoreApartmentTypeRequest;
use App\Http\Requests\Admin\ApartmentType\UpdateApartmentTypeRequest;
use App\Http\Requests\Admin\ApartmentType\UpdateApartmentTypeStatusRequest;
use App\Http\Resources\ApartmentTypeResource;
use App\Models\ApartmentType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApartmentTypeController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(ApartmentType::class, 'apartmentType');
        $this->middleware('permission:apartment-types.viewAny')->only('index');
        $this->middleware('permission:apartment-types.view')->only('show');
        $this->middleware('permission:apartment-types.create')->only('store');
        $this->middleware('permission:apartment-types.update')->only('update');
        $this->middleware('permission:apartment-types.delete')->only('destroy');
        $this->middleware('permission:apartment-types.status')->only('status');
    }

    public function index(Request $request)
    {
        $query = ApartmentType::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'sort_order')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));

        $allowedSorts = ['id', 'slug', 'name', 'is_active', 'sort_order', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage);

        return $this->paginated(ApartmentTypeResource::class, $paginator);
    }

    public function store(StoreApartmentTypeRequest $request)
    {
        $apartmentType = DB::transaction(fn () => ApartmentType::create($request->validated()));

        return new ApartmentTypeResource($apartmentType);
    }

    public function show(ApartmentType $apartmentType)
    {
        return new ApartmentTypeResource($apartmentType);
    }

    public function update(UpdateApartmentTypeRequest $request, ApartmentType $apartmentType)
    {
        $apartmentType->update($request->validated());

        return new ApartmentTypeResource($apartmentType->refresh());
    }

    public function destroy(ApartmentType $apartmentType)
    {
        $apartmentType->delete();

        return response()->noContent();
    }

    public function status(UpdateApartmentTypeStatusRequest $request, ApartmentType $apartmentType)
    {
        $this->authorize('status', $apartmentType);

        $apartmentType->update(['is_active' => $request->validated()['is_active']]);

        return new ApartmentTypeResource($apartmentType->refresh());
    }
}
