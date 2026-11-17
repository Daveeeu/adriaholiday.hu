<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use App\Support\Booking\TourBookingStatus;
use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'booking_type',
        'status',
        'payment_status',
        'region_id',
        'location_id',
        'offer_id',
        'offer_date_id',
        'apartment_id',
        'tour_id',
        'tour_date_id',
        'admin_note',
        'customer_name',
        'email',
        'phone',
        'country',
        'address',
        'city',
        'adults',
        'children',
        'passenger_count',
        'check_in',
        'check_out',
        'departure_date',
        'arrival',
        'departure',
        'appointment_time',
        'application_date',
        'booking_date',
        'property_name_snapshot',
        'offer_name_snapshot',
        'apartment_name_snapshot',
        'partner_name_snapshot',
        'offer_code',
        'coupon_code',
        'total_amount',
        'paid_amount',
        'currency',
        'credited',
        'cancelled',
        'notes',
        'message',
        'payload',
    ];

    protected $hidden = [
        'details_token_hash',
    ];

    protected $casts = [
        'adults' => 'integer',
        'children' => 'integer',
        'passenger_count' => 'integer',
        'check_in' => 'date',
        'check_out' => 'date',
        'departure_date' => 'date',
        'arrival' => 'date',
        'departure' => 'date',
        'appointment_time' => 'datetime',
        'application_date' => 'datetime',
        'booking_date' => 'datetime',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'credited' => 'boolean',
        'cancelled' => 'boolean',
        'payload' => 'array',
    ];

    /**
     * Seats a booking holds: its passengers, at least one (a booking saved
     * without a passenger count still takes a seat).
     */
    public const SEATS_HELD = 'CASE WHEN passenger_count IS NULL OR passenger_count = 0 THEN 1 ELSE passenger_count END';

    /**
     * Tour bookings that keep their seats on the date: every one not
     * cancelled or expired, whether it came from the site, the office or the
     * legacy system.
     */
    public function scopeHoldingSeats(Builder $query): void
    {
        $query->where('booking_type', 'tour_booking')
            ->where('cancelled', false)
            ->whereNotIn('status', [TourBookingStatus::CANCELLED, TourBookingStatus::EXPIRED]);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function apartment(): BelongsTo
    {
        return $this->belongsTo(Apartment::class);
    }

    /**
     * The booked tour, also once the tour is deleted: a booking keeps showing
     * what was booked.
     */
    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class)->withTrashed();
    }

    /**
     * Includes a date since removed from the tour: the booking was made for it.
     */
    public function tourDate(): BelongsTo
    {
        return $this->belongsTo(TourDate::class)->withTrashed();
    }

    public function emailLogs(): HasMany
    {
        return $this->hasMany(EmailLog::class)->orderByDesc('created_at');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(BookingPayment::class)->orderByDesc('created_at')->orderByDesc('id');
    }
}
