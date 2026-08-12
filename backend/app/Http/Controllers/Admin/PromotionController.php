<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Booking\StorePromotionRequest;
use App\Http\Requests\Admin\Booking\UpdatePromotionRequest;
use App\Http\Requests\Admin\Booking\UpdatePromotionStatusRequest;
use App\Http\Resources\PromotionResource;
use App\Models\Promotion;
use App\Support\PublicContentCache;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PromotionController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(Promotion::class, 'promotion');
        $this->middleware('permission:promotions.viewAny')->only('index');
        $this->middleware('permission:promotions.view')->only('show');
        $this->middleware('permission:promotions.create')->only('store');
        $this->middleware('permission:promotions.update')->only('update');
        $this->middleware('permission:promotions.delete')->only('destroy');
        $this->middleware('permission:promotions.status')->only('status');
    }

    public function index(Request $request)
    {
        $query = Promotion::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'created_at')));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'desc'));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $allowedSorts = ['id', 'title', 'is_active', 'starts_at', 'expires_at', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc')
            ->paginate($perPage);

        return $this->paginated(PromotionResource::class, $paginator);
    }

    public function store(StorePromotionRequest $request)
    {
        $promotion = Promotion::create($request->validated());

        PublicContentCache::bump(PublicContentCache::PROMOTIONS);

        return new PromotionResource($promotion);
    }

    public function show(Promotion $promotion)
    {
        return new PromotionResource($promotion);
    }

    public function update(UpdatePromotionRequest $request, Promotion $promotion)
    {
        $promotion->update($request->validated());

        PublicContentCache::bump(PublicContentCache::PROMOTIONS);

        return new PromotionResource($promotion->refresh());
    }

    public function destroy(Promotion $promotion)
    {
        $promotion->delete();

        PublicContentCache::bump(PublicContentCache::PROMOTIONS);

        return response()->noContent();
    }

    public function status(UpdatePromotionStatusRequest $request, Promotion $promotion)
    {
        $this->authorize('status', $promotion);

        $promotion->update(['is_active' => $request->validated()['is_active']]);

        PublicContentCache::bump(PublicContentCache::PROMOTIONS);

        return new PromotionResource($promotion->refresh());
    }
}
