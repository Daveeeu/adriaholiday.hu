<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Testimonial\StoreTestimonialRequest;
use App\Http\Requests\Admin\Testimonial\UpdateTestimonialRequest;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use App\Support\PublicContentCache;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TestimonialController extends Controller
{
    use RespondsWithPagination;

    private const SORTS = ['id', 'title', 'author', 'published_at', 'active'];

    public function __construct()
    {
        $this->authorizeResource(Testimonial::class, 'testimonial');
        $this->middleware('permission:testimonials.viewAny')->only('index');
        $this->middleware('permission:testimonials.view')->only('show');
        $this->middleware('permission:testimonials.create')->only('store');
        $this->middleware('permission:testimonials.update')->only('update');
        $this->middleware('permission:testimonials.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = Testimonial::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(fn ($builder) => $builder
                ->where('title', 'like', "%{$search}%")
                ->orWhere('author', 'like', "%{$search}%"));
        }

        $sortBy = Str::snake((string) $request->query('sortBy', 'published_at'));
        $direction = $request->query('sortDirection', 'desc') === 'asc' ? 'asc' : 'desc';

        $paginator = $query
            ->orderBy(in_array($sortBy, self::SORTS, true) ? $sortBy : 'published_at', $direction)
            ->orderByDesc('id')
            ->paginate(min(100, max(1, (int) $request->query('perPage', 25))));

        return $this->paginated(TestimonialResource::class, $paginator);
    }

    public function store(StoreTestimonialRequest $request)
    {
        $testimonial = Testimonial::query()->create($request->validated());

        PublicContentCache::bump(PublicContentCache::TESTIMONIALS);

        return new TestimonialResource($testimonial);
    }

    public function show(Testimonial $testimonial)
    {
        return new TestimonialResource($testimonial);
    }

    public function update(UpdateTestimonialRequest $request, Testimonial $testimonial)
    {
        $testimonial->update($request->validated());

        PublicContentCache::bump(PublicContentCache::TESTIMONIALS);

        return new TestimonialResource($testimonial->refresh());
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();

        PublicContentCache::bump(PublicContentCache::TESTIMONIALS);

        return response()->noContent();
    }
}
