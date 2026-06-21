<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Gallery\StoreGalleryRequest;
use App\Http\Requests\Admin\Gallery\UpdateGalleryRequest;
use App\Http\Resources\GalleryResource;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GalleryController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(Gallery::class, 'gallery');
        $this->middleware('permission:galleries.viewAny')->only('index');
        $this->middleware('permission:galleries.view')->only('show');
        $this->middleware('permission:galleries.create')->only('store');
        $this->middleware('permission:galleries.update')->only('update');
        $this->middleware('permission:galleries.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = Gallery::query()->with(['region', 'media']);

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'sort_order')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));
        $allowedSorts = ['id', 'title', 'category', 'is_active', 'sort_order', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage);

        return $this->paginated(GalleryResource::class, $paginator);
    }

    public function store(StoreGalleryRequest $request)
    {
        $gallery = Gallery::create($request->validated());

        return new GalleryResource($gallery->load('region', 'media'));
    }

    public function show(Gallery $gallery)
    {
        return new GalleryResource($gallery->load('region', 'media'));
    }

    public function update(UpdateGalleryRequest $request, Gallery $gallery)
    {
        $gallery->update($request->validated());

        return new GalleryResource($gallery->refresh()->load('region', 'media'));
    }

    public function destroy(Gallery $gallery)
    {
        $gallery->delete();

        return response()->noContent();
    }
}
