<?php

namespace Tests\Feature;

use App\Mail\NewTourBookingOfficeNotification;
use App\Models\Booking;
use App\Models\Coupon;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class TourBookingPricingTest extends TestCase
{
    use RefreshDatabase;

    private const ALONE = 'Egyedül szeretnék lenni a szobában';

    private const ROOMMATE = 'Szeretnék szobatársat';

    private Tour $tour;

    private TourDate $tourDate;

    private TourDateExtra $dinner;

    private TourDateExtra $flight;

    private TourDateExtra $singleRoom;

    private TourDeparturePlace $bok;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tour = Tour::factory()->create(['active' => true, 'booking_form_template_id' => null, 'couponable' => true]);
        $this->tourDate = TourDate::factory()->for($this->tour)->create([
            'start_date' => today()->addDays(60),
            'end_date' => today()->addDays(61),
            'price' => 45900,
            'price_box_price' => 45900,
        ]);

        $this->dinner = TourDateExtra::factory()->for($this->tourDate)->create([
            'name' => 'Vacsora', 'price' => 8800, 'price_unit' => TourExtraPriceUnit::PER_PERSON,
            'charge_rule' => TourExtraChargeRule::OPTIONAL, 'sort_order' => 1,
        ]);
        $this->flight = TourDateExtra::factory()->for($this->tourDate)->create([
            'name' => 'Repülőjegy', 'price' => 30000, 'price_unit' => TourExtraPriceUnit::PER_PERSON,
            'charge_rule' => TourExtraChargeRule::MANDATORY, 'sort_order' => 2,
        ]);
        $this->singleRoom = TourDateExtra::factory()->for($this->tourDate)->create([
            'name' => 'Egyágyas felár', 'price' => 13800, 'price_unit' => TourExtraPriceUnit::PER_BOOKING,
            'charge_rule' => TourExtraChargeRule::SOLO_TRAVELLER, 'choices' => [self::ALONE, self::ROOMMATE], 'sort_order' => 3,
        ]);

        // The per-tour fee (4 700) overrides the place's general fee (1 000).
        $this->bok = TourDeparturePlace::factory()->create(['name' => 'Budapest BOK csarnok', 'active' => true, 'fee' => 1000]);
        $this->tour->departurePlaces()->attach($this->bok, ['fee' => 4700]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function bookingPayload(array $overrides = [], int $passengers = 2): array
    {
        return array_merge([
            'tourId' => $this->tour->id,
            'tourDateId' => $this->tourDate->id,
            'departurePlaceId' => $this->bok->id,
            'extraIds' => [],
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'anna@example.com',
                'contact_phone' => '+36301234567',
            ],
            'passengers' => array_map(fn (int $index): array => [
                'passenger_name' => "Utas {$index}",
                'passenger_birth_date' => '1990-01-01',
            ], range(1, $passengers)),
        ], $overrides);
    }

    /**
     * @return array<string, mixed>
     */
    private function pricingOf(TestResponse $response): array
    {
        $response->assertCreated();

        return Booking::query()->findOrFail($response->json('id'))->payload['pricing'];
    }

    public function test_total_includes_base_price_per_tour_departure_fee_mandatory_and_selected_extras(): void
    {
        $response = $this->postJson('/api/bookings', $this->bookingPayload(['extraIds' => [$this->dinner->id]]));
        $pricing = $this->pricingOf($response);
        $booking = Booking::query()->findOrFail($response->json('id'));

        // 2 × 45 900 + 2 × 4 700 + 2 × 30 000 (mandatory) + 2 × 8 800; no single room for two passengers
        $this->assertEquals(178800, (float) $booking->total_amount);
        $this->assertSame('HUF', $booking->currency);
        $this->assertEquals(9400, $pricing['departurePlace']['total']);
        $this->assertSame(['Vacsora', 'Repülőjegy'], array_column($pricing['extras'], 'name'));
        $this->assertSame([2, 2], array_column($pricing['extras'], 'quantity'));
        $this->assertEquals($pricing['tripTotal'], $pricing['total']);
    }

    public function test_solo_traveller_is_charged_the_single_room_supplement_with_the_chosen_option(): void
    {
        $withoutChoice = $this->postJson('/api/bookings', $this->bookingPayload(passengers: 1));
        $withoutChoice->assertStatus(422);
        $withoutChoice->assertJsonValidationErrors(['extraChoices']);

        $pricing = $this->pricingOf($this->postJson('/api/bookings', $this->bookingPayload([
            'extraChoices' => [$this->singleRoom->id => self::ROOMMATE],
        ], passengers: 1)));

        $singleRoom = collect($pricing['extras'])->firstWhere('name', 'Egyágyas felár');
        $this->assertSame(self::ROOMMATE, $singleRoom['choice']);
        $this->assertEquals(13800, $singleRoom['total']);
        // 45 900 + 4 700 + 30 000 + 13 800
        $this->assertEquals(94400, $pricing['total']);
    }

    public function test_solo_traveller_supplement_cannot_be_selected_by_groups(): void
    {
        $pricing = $this->pricingOf($this->postJson('/api/bookings', $this->bookingPayload([
            'extraIds' => [$this->singleRoom->id],
        ])));

        $this->assertNull(collect($pricing['extras'])->firstWhere('name', 'Egyágyas felár'));
    }

    public function test_discount_badge_shown_in_the_price_box_reduces_the_base_price(): void
    {
        $this->tourDate->update(['price_box_discount_badge' => '-10%']);

        $pricing = $this->pricingOf($this->postJson('/api/bookings', $this->bookingPayload()));

        $this->assertEquals(10, $pricing['discount']['percent']);
        $this->assertEquals(9180, $pricing['discount']['amount']);
        // 91 800 − 9 180 + 9 400 + 60 000
        $this->assertEquals(152020, $pricing['total']);
    }

    public function test_valid_coupon_is_deducted_and_redeemed_once(): void
    {
        Coupon::query()->create(['active' => true, 'name' => 'Hírlevél', 'code' => 'HIR-ABC123', 'value' => 5000, 'used' => false]);

        $pricing = $this->pricingOf($this->postJson('/api/bookings', $this->bookingPayload(['couponCode' => 'HIR-ABC123'])));

        $this->assertEquals(5000, $pricing['coupon']['amount']);
        // 91 800 + 9 400 + 60 000 − 5 000
        $this->assertEquals(156200, $pricing['total']);
        $this->assertTrue(Coupon::query()->where('code', 'HIR-ABC123')->value('used'));

        $again = $this->postJson('/api/bookings', $this->bookingPayload(['couponCode' => 'HIR-ABC123']));
        $again->assertStatus(422);
        $again->assertJsonValidationErrors(['couponCode']);
    }

    public function test_coupon_is_rejected_on_tours_that_do_not_accept_coupons(): void
    {
        $this->tour->update(['couponable' => false]);
        Coupon::query()->create(['active' => true, 'name' => 'Hírlevél', 'code' => 'HIR-ABC123', 'value' => 5000, 'used' => false]);

        $response = $this->postJson('/api/bookings', $this->bookingPayload(['couponCode' => 'HIR-ABC123']));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['couponCode']);
    }

    public function test_insurances_are_priced_from_travel_days_and_trip_total(): void
    {
        $pricing = $this->pricingOf($this->postJson('/api/bookings', $this->bookingPayload([
            'travelInsurance' => true,
            'cancellationInsurance' => true,
        ])));

        $insurances = collect($pricing['insurances'])->keyBy('key');
        // 540 Ft × 2 passengers × 2 days
        $this->assertEquals(2160, $insurances['travel_insurance']['total']);
        // 2.8% of the 161 200 trip total
        $this->assertEquals(4514, $insurances['cancellation_insurance']['total']);
        $this->assertEquals(161200 + 2160 + 4514, $pricing['total']);
    }

    public function test_cancellation_insurance_is_not_sold_shortly_before_departure(): void
    {
        $this->tourDate->update(['start_date' => today()->addDays(3), 'end_date' => today()->addDays(4)]);

        $response = $this->postJson('/api/bookings', $this->bookingPayload(['cancellationInsurance' => true]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['cancellationInsurance']);
    }

    public function test_extra_of_another_tour_date_is_rejected(): void
    {
        $response = $this->postJson('/api/bookings', $this->bookingPayload(['extraIds' => [TourDateExtra::factory()->create()->id]]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['extraIds']);
        $this->assertSame(0, Booking::query()->count());
    }

    public function test_departure_place_is_required_and_must_belong_to_the_tour(): void
    {
        $this->postJson('/api/bookings', $this->bookingPayload(['departurePlaceId' => null]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['departurePlaceId']);

        $this->postJson('/api/bookings', $this->bookingPayload(['departurePlaceId' => TourDeparturePlace::factory()->create()->id]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['departurePlaceId']);
    }

    public function test_offer_detail_exposes_booking_options(): void
    {
        TourDeparturePlace::factory()->create(['active' => false])->tours()->attach($this->tour);

        $response = $this->getJson("/api/portfolio/offers/{$this->tour->seo_name}");

        $response->assertOk();
        $response->assertJsonCount(3, 'dates.0.extras');
        $response->assertJsonPath('dates.0.extras.2.chargeRule', 'solo_traveller');
        $response->assertJsonPath('dates.0.extras.2.choices', [self::ALONE, self::ROOMMATE]);
        $response->assertJsonCount(1, 'departurePlaces');
        $response->assertJsonPath('departurePlaces.0.tourFee', 4700);
        $response->assertJsonPath('bookingInsurances.travelInsurance.dailyFee', 540);
        $response->assertJsonPath('bookingInsurances.cancellationInsurance.minDaysBeforeDeparture', 7);
    }

    public function test_office_notification_lists_the_price_breakdown(): void
    {
        Coupon::query()->create(['active' => true, 'name' => 'Hírlevél', 'code' => 'HIR-ABC123', 'value' => 5000, 'used' => false]);

        $response = $this->postJson('/api/bookings', $this->bookingPayload([
            'extraChoices' => [$this->singleRoom->id => self::ALONE],
            'couponCode' => 'HIR-ABC123',
            'travelInsurance' => true,
        ], passengers: 1));

        $booking = Booking::query()->findOrFail($response->json('id'));
        $html = (new NewTourBookingOfficeNotification($booking, $this->tour))->render();

        $this->assertStringContainsString('Felszállás: Budapest BOK csarnok – 4.700 Ft', $html);
        $this->assertStringContainsString('Repülőjegy (kötelező): 1 × 30.000 Ft = 30.000 Ft', $html);
        $this->assertStringContainsString('Egyágyas felár: 1 × 13.800 Ft = 13.800 Ft – '.self::ALONE, $html);
        $this->assertStringContainsString('Kupon (HIR-ABC123): -5.000 Ft', $html);
        $this->assertStringContainsString('ALFA Compass utasbiztosítás', $html);
        // 45 900 + 4 700 + 30 000 + 13 800 − 5 000 + 540 × 2 days
        $this->assertStringContainsString('Végösszeg: 90.480 Ft', $html);
    }
}
