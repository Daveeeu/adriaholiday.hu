<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Support\Payment\BookingPaymentKind;
use App\Support\Payment\BookingPaymentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BookingPayment>
 */
class BookingPaymentFactory extends Factory
{
    protected $model = BookingPayment::class;

    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'provider' => 'barion',
            'payment_request_id' => (string) Str::uuid(),
            'provider_payment_id' => str_replace('-', '', (string) Str::uuid()),
            'status' => BookingPaymentStatus::STARTED,
            'provider_status' => 'Prepared',
            'kind' => BookingPaymentKind::FULL,
            'amount' => 100000,
            'currency' => 'HUF',
        ];
    }
}
