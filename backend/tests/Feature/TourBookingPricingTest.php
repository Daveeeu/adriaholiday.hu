<?php

namespace Tests\Feature;

use App\Http\Resources\BookingDetailResource;
use App\Mail\NewTourBookingOfficeNotification;
use App\Mail\TourBookingCustomerConfirmation;
use App\Models\Booking;
use App\Models\Coupon;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use App\Services\Booking\BookingTravelBook;
use App\Support\Booking\BookingPriceSummary;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
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
            'termsAccepted' => true,
            'tourId' => $this->tour->id,
            'tourDateId' => $this->tourDate->id,
            'departurePlaceId' => $this->bok->id,
            'extraIds' => [],
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'anna@example.com',
                'contact_phone' => '+36301234567',
                'contact_postal_code' => '1051',
                'contact_city' => 'Budapest',
                'contact_address' => 'Fő utca 1.',
            ],
            'passengers' => array_map(fn (int $index): array => [
                'passenger_name' => "Utas {$index}",
                'passenger_birth_date' => '1990-01-01',
                'passenger_address' => '1051 Budapest, Fő utca 1.',
                'document_number' => 'AB123456',
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

    public function test_booking_requires_accepting_the_terms_and_records_when_they_were_accepted(): void
    {
        $this->postJson('/api/bookings', $this->bookingPayload(['termsAccepted' => false]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['terms_accepted']);

        $response = $this->postJson('/api/bookings', $this->bookingPayload())->assertCreated();

        $this->assertNotNull(Booking::query()->findOrFail($response->json('id'))->payload['termsAcceptedAt']);
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

    public function test_a_fee_in_euros_is_listed_as_paid_on_site_and_never_added_to_the_forint_total(): void
    {
        TourDateExtra::factory()->for($this->tourDate)->create([
            'name' => 'Velence városbelépési díj', 'price' => 10, 'currency' => 'EUR', 'price_unit' => TourExtraPriceUnit::PER_PERSON,
            'charge_rule' => TourExtraChargeRule::MANDATORY, 'sort_order' => 4,
        ]);

        $response = $this->postJson('/api/bookings', $this->bookingPayload());
        $pricing = $this->pricingOf($response);

        // 2 × 45 900 + 2 × 4 700 + 2 × 30 000, without the 2 × 10 EUR
        $this->assertEquals(161200, (float) Booking::query()->findOrFail($response->json('id'))->total_amount);
        $this->assertSame(['Repülőjegy'], array_column($pricing['extras'], 'name'));
        $this->assertSame([['name' => 'Velence városbelépési díj', 'currency' => 'EUR', 'quantity' => 2, 'total' => 20]], array_map(
            fn (array $extra): array => ['name' => $extra['name'], 'currency' => $extra['currency'], 'quantity' => $extra['quantity'], 'total' => (int) $extra['total']],
            $pricing['onSiteExtras'],
        ));
    }

    public function test_solo_traveller_is_charged_the_single_room_supplement_with_the_chosen_option(): void
    {
        $withoutChoice = $this->postJson('/api/bookings', $this->bookingPayload(passengers: 1));
        $withoutChoice->assertStatus(422);
        $withoutChoice->assertJsonValidationErrors(['passengerOptions.0.extraChoices']);

        $pricing = $this->pricingOf($this->postJson('/api/bookings', $this->bookingPayload([
            'extraChoices' => [$this->singleRoom->id => self::ROOMMATE],
        ], passengers: 1)));

        $singleRoom = collect($pricing['extras'])->firstWhere('name', 'Egyágyas felár');
        $this->assertSame(self::ROOMMATE, $singleRoom['choice']);
        $this->assertSame([['index' => 0, 'choice' => self::ROOMMATE]], $singleRoom['passengers']);
        $this->assertEquals(13800, $singleRoom['total']);
        // 45 900 + 4 700 + 30 000 + 13 800
        $this->assertEquals(94400, $pricing['total']);
    }

    public function test_group_passengers_choose_the_single_room_supplement_one_by_one(): void
    {
        $withoutChoice = $this->postJson('/api/bookings', $this->bookingPayload([
            'passengerOptions' => [['extraIds' => [$this->singleRoom->id]], []],
        ]));
        $withoutChoice->assertStatus(422);
        $withoutChoice->assertJsonValidationErrors(['passengerOptions.0.extraChoices']);

        $pricing = $this->pricingOf($this->postJson('/api/bookings', $this->bookingPayload([
            'passengerOptions' => [[], ['extraIds' => [$this->singleRoom->id], 'extraChoices' => [$this->singleRoom->id => self::ALONE]]],
        ])));

        $singleRoom = collect($pricing['extras'])->firstWhere('name', 'Egyágyas felár');
        $this->assertSame([['index' => 1, 'choice' => self::ALONE]], $singleRoom['passengers']);
        $this->assertEquals(13800, $singleRoom['total']);
    }

    public function test_per_person_extras_are_charged_only_for_the_passengers_who_chose_them(): void
    {
        $pricing = $this->pricingOf($this->postJson('/api/bookings', $this->bookingPayload([
            'passengerOptions' => [['extraIds' => [$this->dinner->id]], ['extraIds' => []], ['extraIds' => [$this->dinner->id]]],
        ], passengers: 3)));

        $dinner = collect($pricing['extras'])->firstWhere('name', 'Vacsora');
        $this->assertSame(2, $dinner['quantity']);
        $this->assertSame([0, 2], array_column($dinner['passengers'], 'index'));
        $this->assertEquals(17600, $dinner['total']);

        // Mandatory extras stay charged for everyone.
        $this->assertSame(3, collect($pricing['extras'])->firstWhere('name', 'Repülőjegy')['quantity']);
    }

    public function test_insurances_are_priced_for_the_insured_passengers_only(): void
    {
        $pricing = $this->pricingOf($this->postJson('/api/bookings', $this->bookingPayload([
            'passengerOptions' => [
                ['extraIds' => [$this->dinner->id], 'travelInsurance' => true, 'cancellationInsurance' => true],
                ['travelInsurance' => false, 'cancellationInsurance' => false],
            ],
        ])));

        $insurances = collect($pricing['insurances'])->keyBy('key');
        // 540 Ft × 1 passenger × 2 days
        $this->assertEquals(1080, $insurances['travel_insurance']['total']);
        $this->assertSame([0], $insurances['travel_insurance']['passengers']);
        // 2.8% of the first passenger's share: 45 900 + 4 700 + 30 000 + 8 800 (dinner) = 89 400
        $this->assertEquals(2503, $insurances['cancellation_insurance']['total']);
        $this->assertSame([0], $insurances['cancellation_insurance']['passengers']);
    }

    public function test_documents_list_what_each_passenger_chose(): void
    {
        $response = $this->postJson('/api/bookings', $this->bookingPayload([
            'passengerOptions' => [
                ['extraIds' => [$this->dinner->id], 'travelInsurance' => true],
                ['extraIds' => [$this->singleRoom->id], 'extraChoices' => [$this->singleRoom->id => self::ROOMMATE]],
            ],
        ]));
        $booking = Booking::query()->findOrFail($response->json('id'));

        $office = (new NewTourBookingOfficeNotification($booking, $this->tour))->render();
        $this->assertStringContainsString('Utas 1: Vacsora, ALFA Compass utasbiztosítás', $office);
        $this->assertStringContainsString('Utas 2: Egyágyas felár – '.self::ROOMMATE, $office);

        $customer = (new TourBookingCustomerConfirmation($booking, $this->tour))->render();
        $this->assertStringContainsString('Felárak, biztosítás', $customer);
        $this->assertStringContainsString('Vacsora, ALFA Compass utasbiztosítás', $customer);

        $adminFields = (new BookingDetailResource($booking))->toArray(request())['passengerFields'];
        $this->assertContains(
            ['key' => 'selections', 'label' => 'Felárak, biztosítás', 'value' => 'Egyágyas felár – '.self::ROOMMATE],
            $adminFields[1],
        );
    }

    public function test_customer_gets_the_travel_book_with_each_passengers_choices_and_the_program(): void
    {
        $this->tour->programDays()->create(['day_number' => 1, 'sort_order' => 1, 'title' => 'Érkezés Ljubljanába', 'description' => '<p>Városnézés az óvárosban.</p>', 'active' => true]);
        $this->tour->priceItems()->create(['type' => 'included', 'text' => 'autóbusz közlekedés', 'sort_order' => 1, 'active' => true]);
        $this->tour->update(['program_footer' => '<p>A programváltozás jogát fenntartjuk.</p>']);

        $response = $this->postJson('/api/bookings', $this->bookingPayload([
            'passengerOptions' => [
                ['extraIds' => [$this->dinner->id], 'travelInsurance' => true],
                ['extraIds' => [$this->singleRoom->id], 'extraChoices' => [$this->singleRoom->id => self::ROOMMATE]],
            ],
        ]));
        $booking = Booking::query()->findOrFail($response->json('id'));
        $booking->update(['admin_note' => 'Csak az irodának szóló megjegyzés.']);

        $attachments = (new TourBookingCustomerConfirmation($booking, $this->tour))->attachments();
        $this->assertCount(1, $attachments);
        $this->assertSame("utazasi-konyv-{$booking->id}.pdf", $attachments[0]->as);

        $travelBook = app(BookingTravelBook::class);
        $customerCopy = $travelBook->html($booking->refresh());
        $this->assertStringContainsString('Utazási könyv', $customerCopy);
        $this->assertStringContainsString('Vacsora, ALFA Compass utasbiztosítás', $customerCopy);
        $this->assertStringContainsString('Egyágyas felár – '.self::ROOMMATE, $customerCopy);
        $this->assertStringContainsString('Érkezés Ljubljanába', $customerCopy);
        $this->assertStringContainsString('autóbusz közlekedés', $customerCopy);
        $this->assertStringContainsString('A programváltozás jogát fenntartjuk.', $customerCopy);
        $this->assertStringNotContainsString('Csak az irodának szóló megjegyzés.', $customerCopy);

        $this->assertStringContainsString('Csak az irodának szóló megjegyzés.', $travelBook->html($booking, internal: true));
        $this->assertStringStartsWith('%PDF', $travelBook->pdf($booking));
    }

    public function test_bookings_priced_before_per_passenger_choices_list_their_extras_for_everyone(): void
    {
        $booking = Booking::factory()->create(['payload' => ['pricing' => [
            'currency' => 'HUF', 'passengers' => 2, 'basePrice' => 45900.0, 'baseTotal' => 91800.0, 'discount' => null,
            'departurePlace' => null, 'coupon' => null, 'tripTotal' => 109400.0, 'insuranceTotal' => 2160.0, 'total' => 111560.0,
            'extras' => [['id' => 1, 'name' => 'Vacsora', 'price' => 8800.0, 'priceUnit' => 'per_person', 'chargeRule' => 'optional', 'choice' => null, 'quantity' => 2, 'total' => 17600.0]],
            'insurances' => [['key' => 'travel_insurance', 'name' => 'Utasbiztosítás', 'detail' => '2 fő × 2 nap × 540 Ft', 'total' => 2160.0]],
        ]]]);

        $this->assertSame(
            [0 => ['Vacsora', 'Utasbiztosítás'], 1 => ['Vacsora', 'Utasbiztosítás']],
            BookingPriceSummary::of($booking)->passengerSelections(),
        );
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
        $this->assertStringStartsWith('Betegség-, baleset- és poggyászbiztosítás', $response->json('bookingInsurances.travelInsurance.info'));
        $this->assertNotEmpty($response->json('bookingInsurances.cancellationInsurance.info'));
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
        $this->assertMatchesRegularExpression('#>Végösszeg</td>\s*<td[^>]*>90.480 Ft</td>#', $html);
    }

    public function test_a_date_offering_only_some_departure_places_rejects_the_others(): void
    {
        $miskolc = TourDeparturePlace::factory()->create(['name' => 'Miskolc', 'active' => true, 'fee' => 0]);
        $this->tour->departurePlaces()->attach($miskolc);
        $this->tourDate->update(['departure_place_ids' => [$miskolc->id]]);

        $this->postJson('/api/bookings', $this->bookingPayload())->assertStatus(422)->assertJsonValidationErrors('departurePlaceId');
        $this->postJson('/api/bookings', $this->bookingPayload(['departurePlaceId' => $miskolc->id]))->assertCreated();

        $this->getJson('/api/portfolio/offers/'.$this->tour->seo_name)
            ->assertOk()
            ->assertJsonPath('dates.0.departurePlaceIds', [$miskolc->id]);
    }

    public function test_booking_with_the_newsletter_box_ticked_subscribes_the_contact(): void
    {
        Mail::fake();

        $this->postJson('/api/bookings', $this->bookingPayload(['newsletterSubscribe' => true]))->assertCreated();
        $this->postJson('/api/bookings', $this->bookingPayload([
            'formData' => [...$this->bookingPayload()['formData'], 'contact_email' => 'nem-kerek@example.com'],
        ]))->assertCreated();

        $this->assertDatabaseHas('newsletter_subscribers', ['email' => 'anna@example.com']);
        $this->assertDatabaseMissing('newsletter_subscribers', ['email' => 'nem-kerek@example.com']);
    }

    public function test_customer_confirmation_lists_the_booking_and_how_to_pay_by_bank_transfer(): void
    {
        config(['services.barion.pos_key' => null]);
        TourReferenceOption::query()->create(['type' => 'country', 'code' => 'si', 'name' => 'Szlovénia', 'active' => true, 'sort_order' => 0]);
        $this->tour->update(['country_ids' => ['si'], 'accommodation' => 'Hotel***', 'catering' => 'reggeli', 'travel_mode_id' => 'bus']);

        $response = $this->postJson('/api/bookings', $this->bookingPayload([
            'extraChoices' => [$this->singleRoom->id => self::ALONE],
        ], passengers: 1));

        $booking = Booking::query()->findOrFail($response->json('id'));
        $html = (new TourBookingCustomerConfirmation($booking, $this->tour))->render();

        $this->assertStringContainsString('Kedves Kovács Anna!', $html);
        $this->assertStringContainsString('Utas 1', $html);
        $this->assertStringContainsString('Hotel***', $html);
        $this->assertStringContainsString('Autóbusszal', $html);
        $this->assertStringContainsString('Budapest BOK csarnok', $html);
        $this->assertStringContainsString('Egyágyas felár (1 × 13.800 Ft) – '.self::ALONE, $html);
        // 45 900 + 4 700 + 30 000 + 13 800
        $this->assertStringContainsString('94.400 Ft', $html);
        $this->assertStringContainsString('biztosítást nem rendelt', $html);
        $this->assertStringContainsString('OTP 11734004-20467221', $html);
        // 60 days to departure: 40% deposit within 48 hours, the rest 30 days before departure.
        $this->assertStringContainsString('1. részlet – előleg', $html);
        $this->assertStringContainsString('37.760 Ft', $html);
        $this->assertStringContainsString($booking->created_at->setTimezone('Europe/Budapest')->addHours(48)->format('Y.m.d. H:i'), $html);
        $this->assertStringContainsString('56.640 Ft', $html);
        $this->assertStringContainsString($this->tourDate->start_date->copy()->subDays(30)->format('Y.m.d.'), $html);
        $this->assertStringContainsString('az utazás előtt 30 nappal', $html);
        $this->assertStringContainsString('https://konzinfo.mfa.gov.hu/utazasi-tanacsok-orszagonkent/szlovenia', $html);
        $this->assertStringContainsString('/aszf', $html);
        $this->assertStringContainsString('BFKH eng.szám: U-000412', $html);
    }
}
