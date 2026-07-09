<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Booking\StoreBookingRequest;
use App\Http\Requests\Admin\Booking\UpdateBookingRequest;
use App\Http\Requests\Admin\Booking\UpdateBookingStatusRequest;
use App\Http\Resources\BookingActivityResource;
use App\Http\Resources\BookingDetailResource;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\Booking\TourBookingStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;

class BookingController extends Controller
{
    use RespondsWithPagination;

    public function __construct(private readonly TourBookingStatusService $tourBookingStatusService)
    {
        $this->authorizeResource(Booking::class, 'booking');
        $this->middleware('permission:bookings.viewAny')->only('index');
        $this->middleware('permission:bookings.view')->only(['show', 'activities']);
        $this->middleware('permission:bookings.create')->only('store');
        $this->middleware('permission:bookings.update')->only('update');
        $this->middleware('permission:bookings.delete')->only('destroy');
        $this->middleware('permission:bookings.status')->only('status');
        $this->middleware('permission:bookings.export')->only('export');
    }

    public function index(Request $request)
    {
        $bookingType = $this->resolveBookingType($request);
        $query = Booking::query();

        if ($bookingType) {
            $query->where('booking_type', $bookingType);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('property_name_snapshot', 'like', "%{$search}%")
                    ->orWhere('offer_name_snapshot', 'like', "%{$search}%")
                    ->orWhere('apartment_name_snapshot', 'like', "%{$search}%")
                    ->orWhere('partner_name_snapshot', 'like', "%{$search}%")
                    ->orWhere('offer_code', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('payment_status', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if (($paymentStatus = $request->query('payment_status', $request->query('paymentStatus'))) !== null) {
            $query->where('payment_status', $paymentStatus);
        }

        if (($credited = $request->query('credited')) !== null) {
            $query->where('credited', filter_var($credited, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
        }

        if (($cancelled = $request->query('cancelled')) !== null) {
            $query->where('cancelled', filter_var($cancelled, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
        }

        if ($tourId = $request->query('tour_id', $request->query('tourId'))) {
            $query->where('tour_id', $tourId);
        }

        if ($dateFrom = $request->query('date_from', $request->query('dateFrom'))) {
            $query->whereDate('departure_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->query('date_to', $request->query('dateTo'))) {
            $query->whereDate('departure_date', '<=', $dateTo);
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'created_at')));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'desc'));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortMap = $this->sortMap($bookingType);
        $sortColumn = $sortMap[$sortBy] ?? 'created_at';
        $allowedColumns = array_values($sortMap);
        if (! in_array($sortColumn, $allowedColumns, true)) {
            $sortColumn = 'created_at';
        }

        $paginator = $query->orderBy($sortColumn, $sortDirection === 'asc' ? 'asc' : 'desc')
            ->paginate($perPage);

        return $this->paginated(BookingResource::class, $paginator);
    }

    public function store(StoreBookingRequest $request)
    {
        $validated = $request->validated();
        $bookingType = $this->resolveBookingType($request);

        if ($bookingType) {
            $validated['booking_type'] = $bookingType;
        }

        $booking = Booking::create($validated);

        return new BookingDetailResource($booking->load(['region', 'location', 'apartment', 'tour.bookingFormTemplate.templateFields.field', 'tourDate']));
    }

    public function show(Request $request, Booking $booking)
    {
        $this->ensureBookingTypeMatches($request, $booking);

        return new BookingDetailResource($booking->load(['region', 'location', 'apartment', 'tour.bookingFormTemplate.templateFields.field', 'tourDate']));
    }

    public function update(UpdateBookingRequest $request, Booking $booking)
    {
        $this->ensureBookingTypeMatches($request, $booking);

        $validated = $request->validated();
        $bookingType = $this->resolveBookingType($request);

        if ($bookingType) {
            $validated['booking_type'] = $bookingType;
        }

        $booking->update($validated);

        return new BookingDetailResource($booking->refresh()->load(['region', 'location', 'apartment', 'tour.bookingFormTemplate.templateFields.field', 'tourDate']));
    }

    public function destroy(Request $request, Booking $booking)
    {
        $this->ensureBookingTypeMatches($request, $booking);

        $booking->delete();

        return response()->noContent();
    }

    public function status(UpdateBookingStatusRequest $request, Booking $booking)
    {
        $this->authorize('status', $booking);
        $this->ensureBookingTypeMatches($request, $booking);

        $nextStatus = $request->validated()['status'];

        if ($booking->booking_type === 'tour_booking') {
            $booking = $this->tourBookingStatusService->transition($booking, $nextStatus, $request->user()?->id);
        } else {
            $booking->update(['status' => $nextStatus]);
            $booking = $booking->refresh();
        }

        return new BookingResource($booking);
    }

    public function activities(Request $request, Booking $booking)
    {
        $this->ensureBookingTypeMatches($request, $booking);

        $activities = Activity::query()
            ->where('subject_type', Booking::class)
            ->where('subject_id', $booking->id)
            ->with('causer')
            ->latest()
            ->get();

        return BookingActivityResource::collection($activities);
    }

    public function export(Request $request)
    {
        $bookingType = $this->resolveBookingType($request) ?? 'tour_booking';

        $bookings = Booking::query()
            ->where('booking_type', $bookingType)
            ->orderByDesc('created_at')
            ->get();

        $columns = ['ID', 'Státusz', 'Kapcsolattartó', 'Email', 'Telefon', 'Ajánlat', 'Indulás', 'Utasok', 'Létrehozva'];

        $csv = fopen('php://temp', 'w+');
        fputcsv($csv, $columns);

        foreach ($bookings as $booking) {
            fputcsv($csv, [
                $booking->id,
                $booking->status,
                $booking->customer_name,
                $booking->email,
                $booking->phone,
                $booking->offer_name_snapshot,
                $booking->departure_date?->toDateString(),
                $booking->passenger_count,
                $booking->created_at?->toDateString(),
            ]);
        }

        rewind($csv);
        $content = stream_get_contents($csv);
        fclose($csv);

        return response($content, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$bookingType}-export.csv\"",
        ]);
    }

    private function resolveBookingType(Request $request): ?string
    {
        $bookingType = $request->route('booking_type', $request->query('bookingType', $request->query('booking_type')));

        return $bookingType !== null && $bookingType !== '' ? (string) $bookingType : null;
    }

    private function ensureBookingTypeMatches(Request $request, Booking $booking): void
    {
        $bookingType = $this->resolveBookingType($request);

        if ($bookingType !== null && $booking->booking_type !== $bookingType) {
            abort(404);
        }
    }

    /**
     * @return array<string, string>
     */
    private function sortMap(?string $bookingType): array
    {
        return match ($bookingType) {
            'tour_booking' => [
                'id' => 'id',
                'partner' => 'partner_name_snapshot',
                'email' => 'email',
                'offer' => 'offer_name_snapshot',
                'appointment_time' => 'appointment_time',
                'application_date' => 'application_date',
                'status' => 'status',
                'cancelled' => 'cancelled',
                'created_at' => 'created_at',
            ],
            'tour_inquiry' => [
                'id' => 'id',
                'name' => 'customer_name',
                'email' => 'email',
                'offer' => 'offer_name_snapshot',
                'time' => 'appointment_time',
                'created_at' => 'created_at',
                'status' => 'status',
            ],
            'apartment_booking' => [
                'id' => 'id',
                'name' => 'customer_name',
                'email' => 'email',
                'apartment' => 'apartment_name_snapshot',
                'application_time' => 'application_date',
                'booking_date' => 'booking_date',
                'offer_code' => 'offer_code',
                'passengers' => 'passenger_count',
                'credited' => 'credited',
                'created_at' => 'created_at',
                'status' => 'status',
            ],
            default => [
                'id' => 'id',
                'booking_type' => 'booking_type',
                'name' => 'customer_name',
                'email' => 'email',
                'status' => 'status',
                'payment_status' => 'payment_status',
                'created_at' => 'created_at',
                'cancelled' => 'cancelled',
                'credited' => 'credited',
            ],
        };
    }
}
