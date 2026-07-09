<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    /** @use HasFactory<\Database\Factories\BookingFactory> */
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
        'seats_reserved',
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
        'total_amount',
        'paid_amount',
        'currency',
        'credited',
        'cancelled',
        'notes',
        'message',
        'payload',
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
        'seats_reserved' => 'boolean',
        'payload' => 'array',
    ];

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

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }

    public function tourDate(): BelongsTo
    {
        return $this->belongsTo(TourDate::class);
    }

    public function emailLogs(): HasMany
    {
        return $this->hasMany(EmailLog::class)->orderByDesc('created_at');
    }
}
