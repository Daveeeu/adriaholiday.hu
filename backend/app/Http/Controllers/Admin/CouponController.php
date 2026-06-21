<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Booking\StoreCouponRequest;
use App\Http\Requests\Admin\Booking\UpdateCouponRequest;
use App\Http\Requests\Admin\Booking\UpdateCouponStatusRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(Coupon::class, 'coupon');
        $this->middleware('permission:coupons.viewAny')->only('index');
        $this->middleware('permission:coupons.view')->only('show');
        $this->middleware('permission:coupons.create')->only('store');
        $this->middleware('permission:coupons.update')->only('update');
        $this->middleware('permission:coupons.delete')->only('destroy');
        $this->middleware('permission:coupons.status')->only('status');
    }

    public function index(Request $request)
    {
        $query = Coupon::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if (($active = $request->query('active')) !== null) {
            $query->where('active', filter_var($active, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
        }

        if (($used = $request->query('used')) !== null) {
            $query->where('used', filter_var($used, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'created_at')));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'desc'));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $allowedSorts = ['id', 'name', 'email', 'code', 'value', 'expires_at', 'used', 'active', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc')
            ->paginate($perPage);

        return $this->paginated(CouponResource::class, $paginator);
    }

    public function store(StoreCouponRequest $request)
    {
        $coupon = Coupon::create($request->validated());

        return new CouponResource($coupon);
    }

    public function show(Coupon $coupon)
    {
        return new CouponResource($coupon);
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon)
    {
        $coupon->update($request->validated());

        return new CouponResource($coupon->refresh());
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();

        return response()->noContent();
    }

    public function status(UpdateCouponStatusRequest $request, Coupon $coupon)
    {
        $this->authorize('status', $coupon);

        $status = $request->validated()['status'];

        $coupon->update([
            'active' => $status === 'active',
            'used' => $status === 'used',
        ]);

        return new CouponResource($coupon->refresh());
    }
}
