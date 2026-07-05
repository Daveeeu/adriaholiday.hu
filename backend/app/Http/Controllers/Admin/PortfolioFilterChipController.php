<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PortfolioFilterChip\StorePortfolioFilterChipRequest;
use App\Http\Requests\Admin\PortfolioFilterChip\UpdatePortfolioFilterChipRequest;
use App\Http\Resources\PortfolioFilterChipResource;
use App\Models\PortfolioFilterChip;
use App\Support\PublicContentCache;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PortfolioFilterChipController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(PortfolioFilterChip::class, 'portfolioFilterChip');
        $this->middleware('permission:portfolio-filter-chips.viewAny')->only('index');
        $this->middleware('permission:portfolio-filter-chips.view')->only('show');
        $this->middleware('permission:portfolio-filter-chips.create')->only('store');
        $this->middleware('permission:portfolio-filter-chips.update')->only('update');
        $this->middleware('permission:portfolio-filter-chips.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = PortfolioFilterChip::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('label', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('scope_value', 'like', "%{$search}%")
                    ->orWhere('filter_value', 'like', "%{$search}%");
            });
        }

        $sortBy = Str::snake((string) $request->query('sortBy', $request->query('sort_by', 'sort_order')));
        $direction = $request->query('sortDirection', $request->query('sort_direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['id', 'label', 'slug', 'scope_type', 'scope_value', 'filter_type', 'sort_order', 'active', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        $paginator = $query
            ->orderBy($sortBy, $direction)
            ->paginate((int) $request->query('perPage', $request->query('per_page', 25)));

        return $this->paginated(PortfolioFilterChipResource::class, $paginator);
    }

    public function store(StorePortfolioFilterChipRequest $request)
    {
        $chip = PortfolioFilterChip::query()->create($request->validated());

        PublicContentCache::bump(PublicContentCache::PORTFOLIO_FILTERS);

        return new PortfolioFilterChipResource($chip);
    }

    public function show(PortfolioFilterChip $portfolioFilterChip)
    {
        return new PortfolioFilterChipResource($portfolioFilterChip);
    }

    public function update(UpdatePortfolioFilterChipRequest $request, PortfolioFilterChip $portfolioFilterChip)
    {
        $portfolioFilterChip->update($request->validated());

        PublicContentCache::bump(PublicContentCache::PORTFOLIO_FILTERS);

        return new PortfolioFilterChipResource($portfolioFilterChip->refresh());
    }

    public function destroy(PortfolioFilterChip $portfolioFilterChip)
    {
        $portfolioFilterChip->delete();

        PublicContentCache::bump(PublicContentCache::PORTFOLIO_FILTERS);

        return response()->noContent();
    }
}
