<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Support\Booking\TourBookingStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DetachLegacyEarlierRunBookingsCommandTest extends TestCase
{
    use RefreshDatabase;

    private TourDate $tourDate;

    protected function setUp(): void
    {
        parent::setUp();

        // As the 2026-11-16 migration left it: 45 free seats in the legacy
        // admin plus the 54 seats of the row's earlier runs' bookings.
        $this->tourDate = TourDate::factory()->for(Tour::factory()->create(['name' => 'Montenegrói üdülés']))->create([
            'start_date' => '2027-09-06',
            'end_date' => '2027-09-12',
            'capacity' => 99,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function booking(array $attributes, bool $legacy = true): Booking
    {
        return Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'status' => TourBookingStatus::CONFIRMED,
            'cancelled' => false,
            'tour_id' => $this->tourDate->tour_id,
            'tour_date_id' => $this->tourDate->id,
            'departure_date' => '2027-09-06',
            'payload' => $legacy ? ['legacy' => ['id' => random_int(1, 999_999)]] : [],
            ...$attributes,
        ]);
    }

    public function test_dry_run_reports_the_earlier_run_bookings_and_writes_nothing(): void
    {
        $this->booking(['booking_date' => '2023-08-25 10:00:00', 'passenger_count' => 54]);

        $this->artisan('adria:legacy-bookings:detach-earlier-runs', ['--dry-run' => true])
            ->expectsOutputToContain('99 → 45')
            ->expectsOutputToContain('Dry run: nothing was written.')
            ->assertSuccessful();

        $this->assertSame(54, $this->tourDate->fresh()->seatsHeld());
        $this->assertSame(99, $this->tourDate->fresh()->capacity);
    }

    public function test_earlier_run_bookings_leave_the_date_and_its_capacity_keeps_the_free_seats(): void
    {
        $earlier = $this->booking(['booking_date' => '2023-08-25 10:00:00', 'passenger_count' => 50]);
        $earlierCancelled = $this->booking(['booking_date' => '2024-01-15 08:00:00', 'passenger_count' => 3, 'status' => TourBookingStatus::CANCELLED, 'cancelled' => true]);
        $earlierNoCount = $this->booking(['booking_date' => '2025-05-29 09:00:00', 'passenger_count' => null]);
        $thisRun = $this->booking(['booking_date' => '2026-10-01 09:00:00', 'passenger_count' => 2]);
        $site = $this->booking(['booking_date' => '2026-08-01 09:00:00', 'passenger_count' => 3], legacy: false);
        $freeBefore = $this->tourDate->fresh()->freeSeats();

        $this->artisan('adria:legacy-bookings:detach-earlier-runs', ['--force' => true])->assertSuccessful();

        foreach ([$earlier, $earlierCancelled, $earlierNoCount] as $booking) {
            $booking->refresh();
            $this->assertNull($booking->tour_date_id);
            $this->assertNull($booking->departure_date);
            $this->assertSame($this->tourDate->tour_id, $booking->tour_id);
        }

        $this->assertSame($this->tourDate->id, $thisRun->fresh()->tour_date_id);
        $this->assertSame($this->tourDate->id, $site->fresh()->tour_date_id);

        $date = $this->tourDate->fresh();
        $this->assertSame(5, $date->seatsHeld());
        $this->assertSame(48, $date->capacity);
        $this->assertSame($freeBefore, $date->freeSeats());
    }

    public function test_a_booking_whose_first_import_named_an_earlier_run_leaves_the_date(): void
    {
        // Booked within a year of the date, but imported while the legacy row
        // still named the run before; the departure day was rewritten since.
        $earlierRun = $this->booking([
            'booking_date' => '2026-09-01 09:00:00',
            'passenger_count' => 4,
            'admin_note' => "Áthozva a régi rendszerből (#8710).\nIdőpont: 2026-09-07 — 2026-09-13\nBiztosítás: nem kért",
        ]);
        $dayMoved = $this->booking([
            'booking_date' => '2026-10-01 09:00:00',
            'passenger_count' => 2,
            'departure_date' => '2027-09-01',
            'admin_note' => "Áthozva a régi rendszerből (#8800).\nIdőpont: 2027-08-30 — 2027-09-05",
        ]);

        $this->artisan('adria:legacy-bookings:detach-earlier-runs', ['--force' => true])
            ->expectsOutputToContain('99 → 95')
            ->assertSuccessful();

        $this->assertNull($earlierRun->fresh()->tour_date_id);
        $this->assertSame($this->tourDate->id, $dayMoved->fresh()->tour_date_id);
    }

    public function test_a_second_run_changes_nothing(): void
    {
        $this->booking(['booking_date' => '2023-08-25 10:00:00', 'passenger_count' => 54]);

        $this->artisan('adria:legacy-bookings:detach-earlier-runs', ['--force' => true])->assertSuccessful();
        $this->artisan('adria:legacy-bookings:detach-earlier-runs', ['--force' => true])
            ->expectsOutputToContain('Bookings: 0')
            ->assertSuccessful();

        $this->assertSame(45, $this->tourDate->fresh()->capacity);
    }
}
