<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Customer\CustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    use RespondsWithPagination;

    private const SORTS = ['id', 'name', 'email', 'city', 'referral_code', 'registered_at', 'created_at'];

    public function __construct()
    {
        $this->authorizeResource(Customer::class, 'customer');
        $this->middleware('permission:customers.viewAny')->only('index');
        $this->middleware('permission:customers.view')->only('show');
        $this->middleware('permission:customers.create')->only('store');
        $this->middleware('permission:customers.update')->only('update');
        $this->middleware('permission:customers.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = Customer::query()->withCount('bookings');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(fn ($builder) => $builder
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('referral_code', 'like', "%{$search}%"));
        }

        $sortBy = Str::snake((string) $request->query('sortBy', 'registered_at'));
        $direction = $request->query('sortDirection', 'desc') === 'asc' ? 'asc' : 'desc';

        $paginator = $query
            ->orderBy(in_array($sortBy, self::SORTS, true) ? $sortBy : 'registered_at', $direction)
            ->orderByDesc('id')
            ->paginate(min(100, max(1, (int) $request->query('perPage', 25))));

        return $this->paginated(CustomerResource::class, $paginator);
    }

    public function store(CustomerRequest $request)
    {
        return new CustomerResource(Customer::query()->create($request->validated()));
    }

    public function show(Customer $customer)
    {
        return new CustomerResource($customer->loadCount('bookings'));
    }

    public function update(CustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());

        return new CustomerResource($customer->refresh()->loadCount('bookings'));
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return response()->noContent();
    }
}
