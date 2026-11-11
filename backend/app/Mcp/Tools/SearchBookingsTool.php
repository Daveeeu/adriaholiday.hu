<?php

namespace App\Mcp\Tools;

use App\Models\Booking;
use App\Services\Booking\BookingSearch;
use App\Services\Mcp\BookingBriefing;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('search_bookings')]
#[Title('Foglalások keresése')]
#[Description('Searches tour bookings, tour inquiries (ajánlatkérés) and apartment bookings with the admin list\'s filters: free text (name, e-mail, phone, trip, offer code), type, status, payment status, cancelled, tour, departure date and the date the booking came in. Returns total_count and one line per booking; use get_booking for passengers, prices, instalments, payments and e-mails.')]
#[IsReadOnly]
#[IsIdempotent]
class SearchBookingsTool extends AdminTool
{
    private const DEFAULT_LIMIT = 25;

    private const MAX_LIMIT = 100;

    private const SORTS = [
        'newest' => ['created_at', 'desc'],
        'oldest' => ['created_at', 'asc'],
        'departure_date' => ['departure_date', 'asc'],
    ];

    public function __construct(
        private readonly BookingSearch $search,
        private readonly BookingBriefing $bookings,
    ) {}

    protected function permission(): string
    {
        return 'bookings.viewAny';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'search' => $schema->string()->description('Text in the customer\'s name, e-mail, phone, address, trip or apartment name or offer code.'),
            'booking_type' => $schema->string()->enum(['tour_booking', 'tour_inquiry', 'apartment_booking'])->description('tour_booking = körutazás foglalás, tour_inquiry = ajánlatkérés, apartment_booking = apartman foglalás.'),
            'status' => $schema->string()->description('Tour bookings: new, contacted, confirmed, cancelled, expired. Inquiries and apartment bookings have their own values (e.g. new).'),
            'payment_status' => $schema->string()->description('Payment status as stored, e.g. pending, paid.'),
            'cancelled' => $schema->boolean()->description('true: only cancelled ones, false: only not cancelled ones.'),
            'tour_id' => $schema->integer()->description('Only bookings of this tour (id from search_tours).'),
            'tour_date_id' => $schema->integer()->description('Only bookings of this departure (id from get_tour\'s departures).'),
            'email' => $schema->string()->description('Exactly this customer e-mail address.'),
            'departure_from' => $schema->string()->format('date')->description('Departure on or after (YYYY-MM-DD).'),
            'departure_to' => $schema->string()->format('date')->description('Departure on or before (YYYY-MM-DD).'),
            'created_from' => $schema->string()->format('date')->description('Came in on or after (YYYY-MM-DD).'),
            'created_to' => $schema->string()->format('date')->description('Came in on or before (YYYY-MM-DD).'),
            'sort' => $schema->string()->enum(array_keys(self::SORTS))->description('Order: newest (default), oldest or departure_date.'),
            'limit' => $schema->integer()->min(1)->max(self::MAX_LIMIT)->description('How many bookings to return (default 25, max 100).'),
        ];
    }

    public function handle(Request $request): ResponseFactory
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:200'],
            'booking_type' => ['nullable', 'in:tour_booking,tour_inquiry,apartment_booking'],
            'status' => ['nullable', 'string', 'max:50'],
            'payment_status' => ['nullable', 'string', 'max:50'],
            'cancelled' => ['nullable', 'boolean'],
            'tour_id' => ['nullable', 'integer'],
            'tour_date_id' => ['nullable', 'integer'],
            'email' => ['nullable', 'string', 'max:255'],
            'departure_from' => ['nullable', 'date_format:Y-m-d'],
            'departure_to' => ['nullable', 'date_format:Y-m-d'],
            'created_from' => ['nullable', 'date_format:Y-m-d'],
            'created_to' => ['nullable', 'date_format:Y-m-d'],
            'sort' => ['nullable', 'in:'.implode(',', array_keys(self::SORTS))],
            'limit' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_LIMIT],
        ]);

        $query = $this->search->query([
            'bookingType' => $validated['booking_type'] ?? null,
            'search' => $validated['search'] ?? null,
            'status' => $validated['status'] ?? null,
            'paymentStatus' => $validated['payment_status'] ?? null,
            'cancelled' => isset($validated['cancelled']) ? (bool) $validated['cancelled'] : null,
            'tourId' => $validated['tour_id'] ?? null,
            'tourDateId' => $validated['tour_date_id'] ?? null,
            'email' => $validated['email'] ?? null,
            'departureFrom' => $validated['departure_from'] ?? null,
            'departureTo' => $validated['departure_to'] ?? null,
            'createdFrom' => $validated['created_from'] ?? null,
            'createdTo' => $validated['created_to'] ?? null,
        ]);

        [$column, $direction] = self::SORTS[$validated['sort'] ?? 'newest'];
        $total = (clone $query)->count();
        $bookings = $query->orderBy($column, $direction)->orderBy('id', $direction)->limit($validated['limit'] ?? self::DEFAULT_LIMIT)->get();

        return $this->respond([
            'total_count' => $total,
            'returned' => $bookings->count(),
            'total_passengers_of_matches' => (int) (clone $query)->reorder()->sum('passenger_count'),
            'bookings' => $bookings->map(fn (Booking $booking): array => $this->bookings->summary($booking))->all(),
        ]);
    }
}
