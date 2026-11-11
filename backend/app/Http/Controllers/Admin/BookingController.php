<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Booking\StoreBookingRequest;
use App\Http\Requests\Admin\Booking\UpdateBookingRequest;
use App\Http\Requests\Admin\Booking\UpdateBookingStatusRequest;
use App\Http\Resources\BookingActivityResource;
use App\Http\Resources\BookingAnalyticsEventResource;
use App\Http\Resources\BookingDetailResource;
use App\Http\Resources\BookingEmailLogResource;
use App\Http\Resources\BookingResource;
use App\Models\AnalyticsEvent;
use App\Models\Booking;
use App\Services\Booking\BookingDetailsRequestService;
use App\Services\Booking\BookingSearch;
use App\Services\Booking\BookingTravelBook;
use App\Services\Booking\TourBookingStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Activitylog\Models\Activity;

class BookingController extends Controller
{
    use RespondsWithPagination;

    public function __construct(private readonly TourBookingStatusService $tourBookingStatusService)
    {
        $this->authorizeResource(Booking::class, 'booking');
        $this->middleware('permission:bookings.viewAny')->only('index');
        $this->middleware('permission:bookings.view')->only(['show', 'activities', 'analytics', 'emails', 'pdf']);
        $this->middleware('permission:bookings.create')->only('store');
        $this->middleware('permission:bookings.update')->only(['update', 'sendDetailsRequest']);
        $this->middleware('permission:bookings.delete')->only('destroy');
        $this->middleware('permission:bookings.status')->only('status');
        $this->middleware('permission:bookings.export')->only('export');
    }

    public function index(Request $request, BookingSearch $bookingSearch)
    {
        $bookingType = $this->resolveBookingType($request);
        $query = $bookingSearch->query([
            'bookingType' => $bookingType,
            'search' => (string) $request->query('search', ''),
            'status' => $request->query('status') ?: null,
            'paymentStatus' => $request->query('payment_status', $request->query('paymentStatus')),
            'credited' => $this->booleanQuery($request, 'credited'),
            'cancelled' => $this->booleanQuery($request, 'cancelled'),
            'tourId' => $request->query('tour_id', $request->query('tourId')) ?: null,
            'departureFrom' => $request->query('date_from', $request->query('dateFrom')) ?: null,
            'departureTo' => $request->query('date_to', $request->query('dateTo')) ?: null,
        ]);

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

        return new BookingDetailResource($booking->load($this->detailRelationsFor($booking->booking_type)));
    }

    public function show(Request $request, Booking $booking)
    {
        $this->ensureBookingTypeMatches($request, $booking);

        return new BookingDetailResource($booking->load($this->detailRelationsFor($booking->booking_type)));
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

        return new BookingDetailResource($booking->refresh()->load($this->detailRelationsFor($booking->booking_type)));
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

    public function analytics(Request $request, Booking $booking)
    {
        $this->ensureBookingTypeMatches($request, $booking);

        $events = AnalyticsEvent::query()
            ->where(function ($query) use ($booking): void {
                $query->where('metadata->booking_id', $booking->id)
                    ->orWhere(function ($inner) use ($booking): void {
                        $inner->where('entity_type', 'booking')->where('entity_id', (string) $booking->id);
                    });
            })
            ->orderBy('created_at')
            ->get();

        return BookingAnalyticsEventResource::collection($events);
    }

    public function emails(Request $request, Booking $booking)
    {
        $this->ensureBookingTypeMatches($request, $booking);

        return BookingEmailLogResource::collection($booking->emailLogs);
    }

    /**
     * The booking's details as a branded PDF (trip, contact, passengers, price,
     * insurance, payment, status and admin note).
     */
    public function pdf(Request $request, Booking $booking, BookingTravelBook $travelBook)
    {
        $this->ensureBookingTypeMatches($request, $booking);
        $this->authorize('view', $booking);

        return response($travelBook->pdf($booking, internal: true), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$travelBook->fileName($booking, internal: true).'"',
        ]);
    }

    /**
     * E-mails the customer a new link for the booking details they left for
     * later; the earlier link stops working.
     */
    public function sendDetailsRequest(Request $request, Booking $booking, BookingDetailsRequestService $detailsRequest)
    {
        $this->ensureBookingTypeMatches($request, $booking);
        $this->authorize('update', $booking);

        if (! $detailsRequest->send($booking)) {
            throw ValidationException::withMessages([
                'booking' => 'Ehhez a foglaláshoz nincs bekérendő adat, vagy hiányzik az ügyfél e-mail címe.',
            ]);
        }

        return response()->noContent();
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

    /**
     * @return array<int, string>
     */
    private function detailRelationsFor(?string $bookingType): array
    {
        return match ($bookingType) {
            'tour_booking' => ['tour.bookingFormTemplate.templateFields.field', 'tourDate', 'payments'],
            'apartment_booking' => ['apartment'],
            'tour_inquiry' => ['tour', 'region'],
            default => ['region', 'location', 'apartment', 'tour.bookingFormTemplate.templateFields.field', 'tourDate'],
        };
    }

    /**
     * A true/false list filter; any other given value counts as false, a missing one as no filter.
     */
    private function booleanQuery(Request $request, string $key): ?bool
    {
        $value = $request->query($key);

        return $value !== null ? (filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false) : null;
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
                'departure_date' => 'departure_date',
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
