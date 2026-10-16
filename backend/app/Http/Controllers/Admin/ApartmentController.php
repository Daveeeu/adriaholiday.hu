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
use App\Services\Apartment\ApartmentGalleryService;
use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApartmentController extends Controller
{
    use RespondsWithPagination;

    private const DETAIL_RELATIONS = ['region', 'location', 'gallery', 'galleryItems.media'];

    public function __construct(private readonly ApartmentGalleryService $galleries)
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

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if (($isAccommodation = $request->query('is_accommodation', $request->query('isAccommodation'))) !== null && $isAccommodation !== '') {
            $query->where('is_accommodation', filter_var($isAccommodation, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
        }

        foreach (['is_active' => 'isActive', 'featured' => 'featured'] as $field => $camelField) {
            $value = $request->query($field, $request->query($camelField));
            if ($value !== null && $value !== '') {
                $query->where($field, filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
            }
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
        $apartment = DB::transaction(fn (): Apartment => $this->save(new Apartment, $request->validated()));

        return new ApartmentDetailResource($apartment->load(self::DETAIL_RELATIONS));
    }

    public function show(Apartment $apartment)
    {
        return new ApartmentDetailResource($apartment->load(self::DETAIL_RELATIONS));
    }

    public function update(UpdateApartmentRequest $request, Apartment $apartment)
    {
        DB::transaction(fn (): Apartment => $this->save($apartment, $request->validated()));

        return new ApartmentDetailResource($apartment->refresh()->load(self::DETAIL_RELATIONS));
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
     * @param  array<string, mixed>  $validated
     */
    private function save(Apartment $apartment, array $validated): Apartment
    {
        $apartment->fill($this->sanitizeContentFields(Arr::except($validated, ['gallery'])))->save();

        // A form without the gallery (an older admin) leaves the gallery alone.
        if (array_key_exists('gallery', $validated) && is_array($validated['gallery'])) {
            $this->galleries->sync($apartment, $validated['gallery']);
        }

        return $apartment;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function sanitizeContentFields(array $validated): array
    {
        $validated['short_description'] = RichTextSanitizer::sanitize($validated['short_description'] ?? '') ?? '';

        foreach ([
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
