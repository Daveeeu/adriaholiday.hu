<?php

namespace Database\Seeders;

use App\Models\Booking;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        Booking::factory()->count(30)->tourBooking()->create();
        Booking::factory()->count(30)->tourInquiry()->create();
        Booking::factory()->count(30)->apartmentBooking()->create();
    }
}
