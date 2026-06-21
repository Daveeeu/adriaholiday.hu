<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Tour\StoreTourPartnerOfferRequest;
use App\Http\Requests\Admin\Tour\UpdateTourPartnerOfferRequest;
use App\Http\Requests\Admin\Tour\UpdateTourPartnerOfferStatusRequest;
use App\Http\Resources\TourPartnerOfferResource;
use App\Models\TourPartnerOffer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class TourPartnerOfferController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(TourPartnerOffer::class, 'tourPartnerOffer');
        $this->middleware('permission:tour-partner-offers.viewAny')->only('index');
        $this->middleware('permission:tour-partner-offers.view')->only('show');
        $this->middleware('permission:tour-partner-offers.create')->only('store');
        $this->middleware('permission:tour-partner-offers.update')->only('update');
        $this->middleware('permission:tour-partner-offers.delete')->only('destroy');
        $this->middleware('permission:tour-partner-offers.status')->only('status');
    }

    public function index(Request $request)
    {
        $query = TourPartnerOffer::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('partner_name', 'like', "%{$search}%")
                    ->orWhere('partner_email', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('note', 'like', "%{$search}%");
            });
        }

        if ($request->query('active') !== null) {
            $query->where('active', filter_var($request->query('active'), FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'created_at')));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'desc'));
        $allowedSorts = ['id', 'name', 'partner_name', 'partner_email', 'inquiry_date', 'status', 'active', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));

        $paginator = $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc')
            ->paginate($perPage);

        return $this->paginated(TourPartnerOfferResource::class, $paginator);
    }

    public function store(StoreTourPartnerOfferRequest $request)
    {
        $offer = DB::transaction(fn () => TourPartnerOffer::create($request->validated()));

        return new TourPartnerOfferResource($offer);
    }

    public function show(TourPartnerOffer $tourPartnerOffer)
    {
        return new TourPartnerOfferResource($tourPartnerOffer);
    }

    public function update(UpdateTourPartnerOfferRequest $request, TourPartnerOffer $tourPartnerOffer)
    {
        $tourPartnerOffer->update($request->validated());

        return new TourPartnerOfferResource($tourPartnerOffer->refresh());
    }

    public function destroy(TourPartnerOffer $tourPartnerOffer)
    {
        $tourPartnerOffer->delete();

        return response()->noContent();
    }

    public function status(UpdateTourPartnerOfferStatusRequest $request, TourPartnerOffer $tourPartnerOffer)
    {
        $this->authorize('status', $tourPartnerOffer);

        $tourPartnerOffer->update(['active' => $request->validated()['active']]);

        return new TourPartnerOfferResource($tourPartnerOffer->refresh());
    }
}
