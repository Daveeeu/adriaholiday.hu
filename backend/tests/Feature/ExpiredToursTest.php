<?php

namespace Tests\Feature;

use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpiredToursTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-10-08 00:10:00');
    }

    private function tourWithDates(string $slug, array $startDates, bool $active = true): Tour
    {
        $tour = Tour::factory()->create(['active' => $active, 'seo_name' => $slug]);

        foreach ($startDates as $start) {
            $tour->dates()->create(['start_date' => $start, 'end_date' => $start, 'price' => 99000, 'status' => 'planned']);
        }

        return $tour;
    }

    public function test_a_tour_whose_every_date_departed_is_switched_off(): void
    {
        $departed = $this->tourWithDates('elmult-ut', ['2026-09-20', '2026-10-07']);
        $upcoming = $this->tourWithDates('kozelgo-ut', ['2026-09-20', '2026-10-08']);
        $onRequest = $this->tourWithDates('osztalykirandulas', []);

        $this->artisan('tours:sync-expired')->assertSuccessful();

        $this->assertFalse($departed->fresh()->active);
        $this->assertNotNull($departed->fresh()->expired_at);
        $this->assertTrue($upcoming->fresh()->active);
        $this->assertTrue($onRequest->fresh()->active);
    }

    public function test_an_expired_tour_comes_back_with_a_new_date_but_one_switched_off_by_hand_does_not(): void
    {
        $expired = $this->tourWithDates('lejart-ut', ['2026-09-20']);
        $this->artisan('tours:sync-expired');
        $switchedOff = $this->tourWithDates('kikapcsolt-ut', ['2026-12-01'], active: false);

        $expired->dates()->create(['start_date' => '2027-05-01', 'end_date' => '2027-05-04', 'price' => 99000, 'status' => 'planned']);
        $this->artisan('tours:sync-expired')->assertSuccessful();

        $this->assertTrue($expired->fresh()->active);
        $this->assertNull($expired->fresh()->expired_at);
        $this->assertFalse($switchedOff->fresh()->active);
    }

    public function test_switching_an_expired_tour_on_by_hand_clears_its_expiry(): void
    {
        $tour = $this->tourWithDates('lejart-ut', ['2026-09-20']);
        $this->artisan('tours:sync-expired');

        $tour->fresh()->update(['active' => true]);

        $this->assertNull($tour->fresh()->expired_at);
    }

    public function test_the_public_site_shows_and_books_only_upcoming_dates(): void
    {
        $tour = $this->tourWithDates('vegyes-ut', ['2026-10-01', '2026-11-20']);
        $departed = $tour->dates()->whereDate('start_date', '2026-10-01')->firstOrFail();

        $this->getJson('/api/portfolio/offers/vegyes-ut')
            ->assertOk()
            ->assertJsonCount(1, 'dates')
            ->assertJsonPath('dates.0.startDate', '2026-11-20');

        $this->postJson('/api/bookings', [
            'termsAccepted' => true,
            'tourId' => $tour->id,
            'tourDateId' => $departed->id,
            'formData' => ['contact_name' => 'Kovács Anna', 'contact_email' => 'anna@example.com', 'contact_phone' => '+36301234567', 'contact_postal_code' => '1051', 'contact_city' => 'Budapest', 'contact_address' => 'Fő utca 1.'],
            'passengers' => [['passenger_name' => 'Kovács Anna']],
        ])->assertStatus(422)->assertJsonValidationErrors(['tour_date_id']);
    }
}
