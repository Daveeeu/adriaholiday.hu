<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Booking\StorePartnerBannerRequest;
use App\Http\Requests\Admin\Booking\UpdatePartnerBannerRequest;
use App\Http\Resources\PartnerBannerResource;
use App\Models\PartnerBanner;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PartnerBannerController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(PartnerBanner::class, 'partnerBanner');
        $this->middleware('permission:partner-banners.viewAny')->only('index');
        $this->middleware('permission:partner-banners.view')->only('show');
        $this->middleware('permission:partner-banners.create')->only('store');
        $this->middleware('permission:partner-banners.update')->only('update');
        $this->middleware('permission:partner-banners.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = PartnerBanner::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('embed_code', 'like', "%{$search}%");
            });
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'created_at')));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'desc'));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $allowedSorts = ['id', 'name', 'url', 'width', 'height', 'status', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc')
            ->paginate($perPage);

        return $this->paginated(PartnerBannerResource::class, $paginator);
    }

    public function store(StorePartnerBannerRequest $request)
    {
        $banner = PartnerBanner::create($request->validated());

        return new PartnerBannerResource($banner);
    }

    public function show(PartnerBanner $partnerBanner)
    {
        return new PartnerBannerResource($partnerBanner);
    }

    public function update(UpdatePartnerBannerRequest $request, PartnerBanner $partnerBanner)
    {
        $partnerBanner->update($request->validated());

        return new PartnerBannerResource($partnerBanner->refresh());
    }

    public function destroy(PartnerBanner $partnerBanner)
    {
        $partnerBanner->delete();

        return response()->noContent();
    }
}
