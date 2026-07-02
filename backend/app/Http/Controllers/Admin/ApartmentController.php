<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Apartment\StoreApartmentRequest;
use App\Http\Requests\Admin\Apartment\UpdateApartmentRequest;
use App\Http\Requests\Admin\Apartment\UpdateApartmentStatusRequest;
use App\Http\Resources\ApartmentDetailResource;
use App\Http\Resources\ApartmentResource;
use App\Models\Apartment;
use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApartmentController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(Apartment::class, 'apartment');
        $this->middleware('permission:apartments.viewAny')->only('index');
        $this->middleware('permission:apartments.view')->only('show');
        $this->middleware('permission:apartments.create')->only('store');
        $this->middleware('permission:apartments.update')->only('update');
        $this->middleware('permission:apartments.delete')->only('destroy');
        $this->middleware('permission:apartments.status')->only('status');
    }

    public function index(Request $request)
    {
        $query = Apartment::query()->with(['region', 'location', 'gallery']);

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($regionId = $request->query('region_id', $request->query('regionId'))) {
            $query->where('region_id', $regionId);
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'sort_order')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));
        $allowedSorts = ['id', 'name', 'slug', 'code', 'type', 'stars', 'is_active', 'featured', 'sort_order', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage);

        return $this->paginated(ApartmentResource::class, $paginator);
    }

    public function store(StoreApartmentRequest $request)
    {
        $validated = $request->validated();

        $apartment = Apartment::create($this->sanitizeContentFields($validated));

        return new ApartmentDetailResource($apartment->load(['region', 'location', 'gallery']));
    }

    public function show(Apartment $apartment)
    {
        return new ApartmentDetailResource($apartment->load(['region', 'location', 'gallery']));
    }

    public function update(UpdateApartmentRequest $request, Apartment $apartment)
    {
        $apartment->update($this->sanitizeContentFields($request->validated()));

        return new ApartmentDetailResource($apartment->refresh()->load(['region', 'location', 'gallery']));
    }

    public function destroy(Apartment $apartment)
    {
        $apartment->delete();

        return response()->noContent();
    }

    public function status(UpdateApartmentStatusRequest $request, Apartment $apartment)
    {
        $apartment->update(['status' => $request->validated()['status']]);

        return new ApartmentResource($apartment->refresh());
    }

    /**
     * @param array<string, mixed> $validated
     * @return array<string, mixed>
     */
    private function sanitizeContentFields(array $validated): array
    {
        foreach ([
            'short_description',
            'description',
            'additional_information',
            'apartment_type_content',
            'apartment_type_description',
            'apartment_type_text_description',
            'apartment_type_text_description_2',
            'all_inclusive_description',
        ] as $field) {
            $validated[$field] = RichTextSanitizer::sanitize($validated[$field] ?? null);
        }

        return $validated;
    }
}
