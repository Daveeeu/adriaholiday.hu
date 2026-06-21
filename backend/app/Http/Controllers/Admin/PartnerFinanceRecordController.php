<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Booking\StorePartnerFinanceRecordRequest;
use App\Http\Requests\Admin\Booking\UpdatePartnerFinanceRecordRequest;
use App\Http\Resources\PartnerFinanceRecordResource;
use App\Models\PartnerFinanceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PartnerFinanceRecordController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(PartnerFinanceRecord::class, 'partnerFinanceRecord');
        $this->middleware('permission:partner-finances.viewAny')->only('index');
        $this->middleware('permission:partner-finances.view')->only('show');
        $this->middleware('permission:partner-finances.create')->only('store');
        $this->middleware('permission:partner-finances.update')->only('update');
        $this->middleware('permission:partner-finances.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = PartnerFinanceRecord::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('partner_name', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('note', 'like', "%{$search}%");
            });
        }

        if (($type = $request->query('type')) !== null) {
            $query->where('type', $type);
        }

        if (($status = $request->query('status')) !== null) {
            $query->where('status', $status);
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'date')));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'desc'));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $allowedSorts = ['id', 'partner_name', 'date', 'amount', 'type', 'status', 'balance', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'date';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc')
            ->paginate($perPage);

        return $this->paginated(PartnerFinanceRecordResource::class, $paginator);
    }

    public function store(StorePartnerFinanceRecordRequest $request)
    {
        $record = PartnerFinanceRecord::create($request->validated());

        return new PartnerFinanceRecordResource($record);
    }

    public function show(PartnerFinanceRecord $partnerFinanceRecord)
    {
        return new PartnerFinanceRecordResource($partnerFinanceRecord);
    }

    public function update(UpdatePartnerFinanceRecordRequest $request, PartnerFinanceRecord $partnerFinanceRecord)
    {
        $partnerFinanceRecord->update($request->validated());

        return new PartnerFinanceRecordResource($partnerFinanceRecord->refresh());
    }

    public function destroy(PartnerFinanceRecord $partnerFinanceRecord)
    {
        $partnerFinanceRecord->delete();

        return response()->noContent();
    }
}
