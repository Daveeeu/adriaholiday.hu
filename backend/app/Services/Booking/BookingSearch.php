<?php

namespace App\Services\Booking;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Builder;

/**
 * The booking filters of the admin's booking lists, shared with the AI
 * assistants' MCP tools so both find exactly the same bookings.
 */
class BookingSearch
{
    /**
     * The columns the free-text search looks in.
     */
    private const SEARCH_COLUMNS = [
        'customer_name',
        'email',
        'phone',
        'country',
        'address',
        'city',
        'property_name_snapshot',
        'offer_name_snapshot',
        'apartment_name_snapshot',
        'partner_name_snapshot',
        'offer_code',
        'status',
        'payment_status',
    ];

    /**
     * @param  array{
     *     bookingType?: string|null,
     *     search?: string|null,
     *     status?: string|null,
     *     paymentStatus?: string|null,
     *     credited?: bool|null,
     *     cancelled?: bool|null,
     *     tourId?: int|string|null,
     *     tourDateId?: int|string|null,
     *     email?: string|null,
     *     departureFrom?: string|null,
     *     departureTo?: string|null,
     *     createdFrom?: string|null,
     *     createdTo?: string|null,
     * }  $filters  null or missing filters are not applied; dates are Y-m-d, inclusive
     * @return Builder<Booking>
     */
    public function query(array $filters): Builder
    {
        $query = Booking::query();

        if (($bookingType = $filters['bookingType'] ?? null) !== null) {
            $query->where('booking_type', $bookingType);
        }

        if (($search = trim((string) ($filters['search'] ?? ''))) !== '') {
            $query->where(function (Builder $builder) use ($search): void {
                foreach (self::SEARCH_COLUMNS as $column) {
                    $builder->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        foreach (['status' => 'status', 'paymentStatus' => 'payment_status', 'credited' => 'credited', 'cancelled' => 'cancelled', 'tourId' => 'tour_id', 'tourDateId' => 'tour_date_id'] as $filter => $column) {
            if (($value = $filters[$filter] ?? null) !== null) {
                $query->where($column, $value);
            }
        }

        if (($email = trim((string) ($filters['email'] ?? ''))) !== '') {
            $query->where('email', $email);
        }

        foreach ([['departureFrom', 'departure_date', '>='], ['departureTo', 'departure_date', '<='], ['createdFrom', 'created_at', '>='], ['createdTo', 'created_at', '<=']] as [$filter, $column, $operator]) {
            if (($date = $filters[$filter] ?? null) !== null) {
                $query->whereDate($column, $operator, $date);
            }
        }

        return $query;
    }
}
