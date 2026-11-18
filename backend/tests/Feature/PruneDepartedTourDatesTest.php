<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PruneDepartedTourDatesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-10-08 00:20:00');
    }

    private function dateOf(Tour $tour, ?string $start): TourDate
    {
        return $tour->dates()->create(['start_date' => $start, 'end_date' => $start, 'price' => 99000, 'status' => 'available']);
    }

    public function test_only_departed_dates_are_soft_deleted_and_the_tours_stay(): void
    {
        $tour = Tour::factory()->create(['active' => true]);
        $departed = $this->dateOf($tour, '2026-10-07');
        $today = $this->dateOf($tour, '2026-10-08');
        $unscheduled = $this->dateOf($tour, null);
        $allDeparted = Tour::factory()->create(['active' => true]);
        $this->dateOf($allDeparted, '2026-09-01');

        $this->artisan('tours:prune-departed-dates --force')
            ->expectsOutputToContain('2 departed date(s) of 2 tour(s) soft deleted.')
            ->assertSuccessful();

        $this->assertSoftDeleted($departed);
        $this->assertNotSoftDeleted($today);
        $this->assertNotSoftDeleted($unscheduled);
        $this->assertNotSoftDeleted($tour);
        $this->assertNotSoftDeleted($allDeparted);
        $this->assertSame(0, $allDeparted->dates()->count());
    }

    public function test_without_force_nothing_is_deleted(): void
    {
        $date = $this->dateOf(Tour::factory()->create(), '2026-09-01');

        $this->artisan('tours:prune-departed-dates')
            ->expectsOutputToContain('[DRY RUN] 1 departed date(s) of 1 tour(s) to soft delete.')
            ->assertSuccessful();

        $this->assertNotSoftDeleted($date);
    }

    public function test_a_booking_still_reaches_its_deleted_date(): void
    {
        $tour = Tour::factory()->create();
        $date = $this->dateOf($tour, '2026-09-01');
        $booking = Booking::factory()->create(['booking_type' => 'tour_booking', 'tour_id' => $tour->id, 'tour_date_id' => $date->id]);

        $this->artisan('tours:prune-departed-dates --force')->assertSuccessful();

        $this->assertTrue($booking->fresh()->tourDate->is($date));
    }

    public function test_a_tour_whose_departed_dates_were_deleted_is_still_switched_off(): void
    {
        $tour = Tour::factory()->create(['active' => true]);
        $this->dateOf($tour, '2026-09-01');

        $this->artisan('tours:prune-departed-dates --force');
        $this->artisan('tours:sync-expired')->assertSuccessful();

        $this->assertFalse($tour->fresh()->active);
        $this->assertNotNull($tour->fresh()->expired_at);
    }
}
