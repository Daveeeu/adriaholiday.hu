<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Support\Booking\TourBookingStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingFactoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_tour_bookings_use_the_admin_workflow_statuses(): void
    {
        $bookings = Booking::factory()->count(30)->tourBooking()->create();

        foreach ($bookings as $booking) {
            $this->assertContains($booking->status, TourBookingStatus::all());
            $this->assertSame($booking->status === TourBookingStatus::CANCELLED, (bool) $booking->cancelled);
        }
    }

    public function test_demo_tour_bookings_are_tied_to_an_existing_tour_date(): void
    {
        $tour = Tour::factory()->create(['name' => 'Adventi Bécs']);
        $date = TourDate::factory()->create(['tour_id' => $tour->id, 'start_date' => '2027-12-04']);

        $booking = Booking::factory()->tourBooking()->create();

        $this->assertSame($date->id, $booking->tour_date_id);
        $this->assertSame($tour->id, $booking->tour_id);
        $this->assertSame('Adventi Bécs', $booking->offer_name_snapshot);
        $this->assertSame('2027-12-04', $booking->departure_date?->format('Y-m-d'));
    }

    public function test_bookings_default_to_the_new_status(): void
    {
        $this->assertSame(TourBookingStatus::NEW, Booking::factory()->create()->status);
    }
}
