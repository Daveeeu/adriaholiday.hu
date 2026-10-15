<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Services\Tour\TourContentSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TourContentSyncLegacyDatesTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_save_without_currencies_keeps_a_fee_paid_on_site_in_euros(): void
    {
        $tour = Tour::factory()->create();
        $date = TourDate::factory()->for($tour)->create(['start_date' => today()->addMonth(), 'end_date' => today()->addMonth()]);
        $sync = app(TourContentSyncService::class);
        $sync->syncDates($tour, [['id' => $date->id, 'extras' => [['name' => 'Városbelépési díj', 'price' => 10, 'currency' => 'EUR']]]]);

        // The admin form before it knew currencies sends the extra without one.
        $sync->syncDates($tour, [['id' => $date->id, 'extras' => [['name' => 'Városbelépési díj', 'price' => 12], ['name' => 'Vacsora', 'price' => 8800]]]]);

        $this->assertSame(['EUR', 'HUF'], $date->extras()->pluck('currency')->all());
    }

    public function test_legacy_dates_match_by_legacy_id_and_only_a_booked_date_survives_when_asked(): void
    {
        $tour = Tour::factory()->create();
        $sameDaysTwice = ['start_date' => today()->addMonth()->toDateString(), 'end_date' => today()->addMonth()->addDays(3)->toDateString()];
        $booked = TourDate::factory()->for($tour)->create(['start_date' => today()->addMonths(2), 'end_date' => today()->addMonths(2)]);
        Booking::factory()->create(['tour_id' => $tour->id, 'tour_date_id' => $booked->id]);
        $sync = app(TourContentSyncService::class);

        // A legacy tour may run twice on the same days: two dates, not one.
        $sync->syncDates($tour, [['legacy_id' => 1, 'price' => 100, ...$sameDaysTwice], ['legacy_id' => 2, 'price' => 200, ...$sameDaysTwice]], keepBooked: true);
        $sync->syncDates($tour, [['legacy_id' => 2, 'price' => 250, ...$sameDaysTwice], ['legacy_id' => 1, 'price' => 150, ...$sameDaysTwice]], keepBooked: true);

        $this->assertEquals([1 => 150, 2 => 250], $tour->dates()->whereNotNull('legacy_id')->pluck('price', 'legacy_id')->map(fn ($price): int => (int) $price)->all());
        $this->assertFalse($booked->fresh()->trashed());

        $sync->syncDates($tour, []);
        $this->assertTrue(TourDate::withTrashed()->findOrFail($booked->id)->trashed());
    }
}
