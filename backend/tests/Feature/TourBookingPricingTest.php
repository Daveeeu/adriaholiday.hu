<?php

namespace Tests\Feature;

use App\Mail\NewTourBookingOfficeNotification;
use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TourBookingPricingTest extends TestCase
{
    use RefreshDatabase;

    private Tour $tour;

    private TourDate $tourDate;

    private TourDateExtra $dinner;

    private TourDateExtra $flight;

    private TourDateExtra $singleRoom;

    private TourDeparturePlace $budapest;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tour = Tour::factory()->create(['active' => true, 'booking_form_template_id' => null]);
        $this->tourDate = TourDate::factory()->for($this->tour)->create(['price' => 45900, 'price_box_price' => 45900]);

        $this->dinner = TourDateExtra::factory()->for($this->tourDate)->create([
            'name' => 'Vacsora', 'price' => 8800, 'price_unit' => TourExtraPriceUnit::PER_PERSON, 'mandatory' => false, 'sort_order' => 1,
        ]);
        $this->flight = TourDateExtra::factory()->for($this->tourDate)->create([
            'name' => 'Repülőjegy', 'price' => 30000, 'price_unit' => TourExtraPriceUnit::PER_PERSON, 'mandatory' => true, 'sort_order' => 2,
        ]);
        $this->singleRoom = TourDateExtra::factory()->for($this->tourDate)->create([
            'name' => 'Egyágyas felár', 'price' => 13800, 'price_unit' => TourExtraPriceUnit::PER_BOOKING, 'mandatory' => false, 'sort_order' => 3,
        ]);

        $this->budapest = TourDeparturePlace::factory()->create(['name' => 'Budapest BOK csarnok', 'active' => true, 'fee' => 4700]);
        $this->tour->departurePlaces()->attach($this->budapest);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function bookingPayload(array $overrides = []): array
    {
        return array_merge([
            'tourId' => $this->tour->id,
            'tourDateId' => $this->tourDate->id,
            'departurePlaceId' => $this->budapest->id,
            'extraIds' => [],
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'anna@example.com',
                'contact_phone' => '+36301234567',
            ],
            'passengers' => [
                ['passenger_name' => 'Kovács Anna', 'passenger_birth_date' => '1990-01-01'],
                ['passenger_name' => 'Kovács Béla', 'passenger_birth_date' => '1988-05-12'],
            ],
        ], $overrides);
    }

    public function test_booking_total_includes_base_price_departure_fee_mandatory_and_selected_extras(): void
    {
        $response = $this->postJson('/api/bookings', $this->bookingPayload([
            'extraIds' => [$this->dinner->id, $this->singleRoom->id],
        ]));

        $response->assertCreated();

        $booking = Booking::query()->findOrFail($response->json('id'));
        $pricing = $booking->payload['pricing'];

        // 2 × 45 900 + 2 × 4 700 + 2 × 30 000 (mandatory) + 2 × 8 800 + 1 × 13 800
        $this->assertEquals(192600, (float) $booking->total_amount);
        $this->assertSame('HUF', $booking->currency);
        $this->assertSame(2, $pricing['passengers']);
        $this->assertEquals(91800, $pricing['baseTotal']);
        $this->assertSame('Budapest BOK csarnok', $pricing['departurePlace']['name']);
        $this->assertEquals(9400, $pricing['departurePlace']['total']);
        $this->assertSame(['Vacsora', 'Repülőjegy', 'Egyágyas felár'], array_column($pricing['extras'], 'name'));
        $this->assertSame([2, 2, 1], array_column($pricing['extras'], 'quantity'));
    }

    public function test_office_notification_lists_the_price_breakdown(): void
    {
        $response = $this->postJson('/api/bookings', $this->bookingPayload([
            'extraIds' => [$this->dinner->id],
        ]));

        $booking = Booking::query()->findOrFail($response->json('id'));
        $html = (new NewTourBookingOfficeNotification($booking, $this->tour))->render();

        $this->assertStringContainsString('Árösszesítő', $html);
        $this->assertStringContainsString('Felszállás: Budapest BOK csarnok – 9.400 Ft', $html);
        $this->assertStringContainsString('Repülőjegy (kötelező): 2 × 30.000 Ft = 60.000 Ft', $html);
        $this->assertStringContainsString('Végösszeg: 178.800 Ft', $html);
    }

    public function test_mandatory_extras_are_charged_even_when_not_selected(): void
    {
        $response = $this->postJson('/api/bookings', $this->bookingPayload());

        $response->assertCreated();

        $pricing = Booking::query()->findOrFail($response->json('id'))->payload['pricing'];
        $this->assertSame(['Repülőjegy'], array_column($pricing['extras'], 'name'));
    }

    public function test_extra_of_another_tour_date_is_rejected(): void
    {
        $foreignExtra = TourDateExtra::factory()->create();

        $response = $this->postJson('/api/bookings', $this->bookingPayload([
            'extraIds' => [$foreignExtra->id],
        ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['extraIds']);
        $this->assertSame(0, Booking::query()->count());
    }

    public function test_departure_place_is_required_when_the_tour_offers_departure_places(): void
    {
        $response = $this->postJson('/api/bookings', $this->bookingPayload(['departurePlaceId' => null]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['departurePlaceId']);
    }

    public function test_departure_place_of_another_tour_is_rejected(): void
    {
        $otherPlace = TourDeparturePlace::factory()->create(['active' => true]);

        $response = $this->postJson('/api/bookings', $this->bookingPayload(['departurePlaceId' => $otherPlace->id]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['departurePlaceId']);
    }

    public function test_offer_detail_exposes_date_extras_and_active_departure_places(): void
    {
        TourDeparturePlace::factory()->create(['active' => false])->tours()->attach($this->tour);

        $response = $this->getJson("/api/portfolio/offers/{$this->tour->seo_name}");

        $response->assertOk();
        $response->assertJsonCount(3, 'dates.0.extras');
        $response->assertJsonPath('dates.0.extras.1.mandatory', true);
        $response->assertJsonCount(1, 'departurePlaces');
        $response->assertJsonPath('departurePlaces.0.fee', 4700);
    }
}
