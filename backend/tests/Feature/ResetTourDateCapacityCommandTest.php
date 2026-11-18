<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Services\Tour\TourContentSyncService;
use App\Support\Booking\TourBookingStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResetTourDateCapacityCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-11-18');
    }

    public function test_it_sets_upcoming_dates_to_45_seats_and_flying_ones_to_22(): void
    {
        $coach = Tour::factory()->create(['travel_mode_id' => 'bus']);
        $unset = Tour::factory()->create(['travel_mode_id' => null]);
        $plane = Tour::factory()->create(['travel_mode_id' => 'plane']);

        $coachDate = $this->date($coach, '2027-05-01', null);
        $unsetDate = $this->date($unset, '2027-05-01', 30);
        $planeDate = $this->date($plane, '2027-05-01', 40);
        $departed = $this->date($coach, '2026-10-01', 12);

        $this->artisan('adria:tours:reset-date-capacity', ['--force' => true])
            ->expectsOutputToContain('3 date(s) updated, 0 already right.')
            ->assertSuccessful();

        $this->assertSame(45, $coachDate->fresh()->capacity);
        $this->assertSame(45, $unsetDate->fresh()->capacity);
        $this->assertSame(22, $planeDate->fresh()->capacity);
        $this->assertSame(12, $departed->fresh()->capacity, 'Departed dates stay as history.');
    }

    public function test_without_force_it_only_reports(): void
    {
        $date = $this->date(Tour::factory()->create(['travel_mode_id' => 'plane']), '2027-05-01', 40);

        $this->artisan('adria:tours:reset-date-capacity')
            ->expectsOutputToContain('[DRY RUN] 1 date(s) to update')
            ->assertSuccessful();

        $this->assertSame(40, $date->fresh()->capacity);
    }

    public function test_a_date_booked_above_the_limit_keeps_its_booked_seats(): void
    {
        $tour = Tour::factory()->create(['travel_mode_id' => 'plane', 'name' => 'Repülős körút']);
        $date = $this->date($tour, '2027-05-01', 40);
        Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'status' => TourBookingStatus::CONFIRMED,
            'cancelled' => false,
            'tour_id' => $tour->id,
            'tour_date_id' => $date->id,
            'passenger_count' => 25,
        ]);

        $this->artisan('adria:tours:reset-date-capacity', ['--force' => true])
            ->expectsOutputToContain('[OVERBOOKED] Repülős körút 2027-05-01: 25 passengers booked')
            ->assertSuccessful();

        $fresh = $date->fresh();
        $this->assertSame(25, $fresh->capacity);
        $this->assertSame(0, $fresh->freeSeats());
    }

    public function test_a_new_date_saved_without_a_capacity_gets_the_travel_mode_default(): void
    {
        $plane = Tour::factory()->create(['travel_mode_id' => 'plane']);
        $coach = Tour::factory()->create(['travel_mode_id' => 'bus']);
        $sync = app(TourContentSyncService::class);

        $sync->syncDates($plane, [['start_date' => '2027-06-01', 'end_date' => '2027-06-05']]);
        $sync->syncDates($coach, [
            ['start_date' => '2027-06-01', 'end_date' => '2027-06-05'],
            ['start_date' => '2027-07-01', 'end_date' => '2027-07-05', 'capacity' => null],
        ]);

        $this->assertSame(22, $plane->dates()->value('capacity'));
        $this->assertSame([45, null], $coach->dates()->orderBy('start_date')->pluck('capacity')->all(), 'An explicit empty capacity still means no limit.');
    }

    private function date(Tour $tour, string $start, ?int $capacity): TourDate
    {
        return TourDate::factory()->for($tour)->create([
            'start_date' => $start,
            'end_date' => date('Y-m-d', strtotime($start.' +4 days')),
            'capacity' => $capacity,
        ]);
    }
}
