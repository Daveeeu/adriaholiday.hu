<?php

namespace App\Models;

use Database\Factories\BookingPaymentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingPayment extends Model
{
    /** @use HasFactory<BookingPaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'provider',
        'payment_request_id',
        'provider_payment_id',
        'status',
        'provider_status',
        'kind',
        'amount',
        'currency',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
