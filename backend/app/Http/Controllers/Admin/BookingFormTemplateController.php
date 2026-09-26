<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BookingFormTemplate\StoreBookingFormTemplateRequest;
use App\Http\Requests\Admin\BookingFormTemplate\UpdateBookingFormTemplateRequest;
use App\Http\Resources\BookingFormTemplateResource;
use App\Models\BookingFormTemplate;
use App\Services\Booking\BookingFormTemplateService;
use Illuminate\Http\Request;

class BookingFormTemplateController extends Controller
{
    use RespondsWithPagination;

    public function __construct(private readonly BookingFormTemplateService $templateService)
    {
        $this->authorizeResource(BookingFormTemplate::class, 'bookingFormTemplate');
        $this->middleware('permission:booking-form-templates.viewAny')->only('index');
        $this->middleware('permission:booking-form-templates.view')->only('show');
        $this->middleware('permission:booking-form-templates.create')->only('store');
        $this->middleware('permission:booking-form-templates.update')->only('update');
        $this->middleware('permission:booking-form-templates.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = BookingFormTemplate::query()->with('templateFields.field');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where('name', 'like', "%{$search}%");
        }

        $activeFilter = $request->query('active');
        if ($activeFilter !== null && $activeFilter !== '') {
            $active = filter_var($activeFilter, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);
            if ($active !== null) {
                $query->where('active', $active);
            }
        }

        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $paginator = $query->orderBy('name')->paginate($perPage);

        return $this->paginated(BookingFormTemplateResource::class, $paginator);
    }

    public function store(StoreBookingFormTemplateRequest $request)
    {
        $template = $this->templateService->create($request->validated());

        return new BookingFormTemplateResource($template->load('templateFields.field'));
    }

    public function show(BookingFormTemplate $bookingFormTemplate)
    {
        return new BookingFormTemplateResource($bookingFormTemplate->load('templateFields.field'));
    }

    public function update(UpdateBookingFormTemplateRequest $request, BookingFormTemplate $bookingFormTemplate)
    {
        $template = $this->templateService->update($bookingFormTemplate, $request->validated());

        return new BookingFormTemplateResource($template->refresh()->load('templateFields.field'));
    }

    public function destroy(BookingFormTemplate $bookingFormTemplate)
    {
        $bookingFormTemplate->delete();

        return response()->noContent();
    }
}
