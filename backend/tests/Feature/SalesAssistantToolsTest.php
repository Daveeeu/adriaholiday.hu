<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use App\Services\SalesAssistant\Tools\SearchTripsTool;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Exceptions;
use Mockery\MockInterface;
use RuntimeException;
use Tests\Concerns\InteractsWithSalesAssistant;
use Tests\TestCase;

class SalesAssistantToolsTest extends TestCase
{
    use InteractsWithSalesAssistant;
    use RefreshDatabase;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-06-01 10:00:00');
        $this->enableSalesAssistant();
        $this->token = $this->startAssistantSession();
    }

    public function test_search_filters_by_destination_travel_mode_budget_and_date_window(): void
    {
        TourReferenceOption::query()->create(['type' => 'country', 'code' => 'hr', 'name' => 'Horvátország', 'active' => true, 'sort_order' => 1]);
        $match = $this->tourWithDate('horvat-buszos', '2026-07-10', '2026-07-15', ['country_ids' => ['hr'], 'travel_mode_id' => 'bus', 'price' => 150000]);
        $this->tourWithDate('horvat-repulos', '2026-07-10', '2026-07-15', ['country_ids' => ['hr'], 'travel_mode_id' => 'plane', 'price' => 150000]);
        $this->tourWithDate('horvat-draga', '2026-07-10', '2026-07-15', ['country_ids' => ['hr'], 'travel_mode_id' => 'bus', 'price' => 350000]);
        $this->tourWithDate('horvat-augusztus', '2026-08-10', '2026-08-15', ['country_ids' => ['hr'], 'travel_mode_id' => 'bus', 'price' => 150000]);
        $this->tourWithDate('olasz-buszos', '2026-07-10', '2026-07-15', ['country_ids' => ['it'], 'travel_mode_id' => 'bus', 'price' => 150000]);

        $response = $this->callRetellFunction('search_trips', [
            'query' => 'Horvátország',
            'travel_mode' => 'bus',
            'max_price_per_person' => 200000,
            'departure_from' => '2026-07-01',
            'departure_until' => '2026-07-31',
        ])->assertOk();

        $response->assertJsonPath('total_matches', 1)
            ->assertJsonPath('trips.0.slug', $match->seo_name)
            ->assertJsonPath('trips.0.travel_mode', 'bus')
            ->assertJsonPath('trips.0.next_departure', ['start_date' => '2026-07-10', 'end_date' => '2026-07-15', 'days' => 6])
            ->assertJsonPath('trips.0.from_price_per_person.amount', 150000)
            ->assertJsonPath('trips.0.from_price_per_person.source', 'catalog');
    }

    public function test_search_returns_at_most_three_trips_bookable_ones_first(): void
    {
        $onRequest = $this->tour('keresre-indulo', ['sort_order' => 1]);
        foreach (range(1, 4) as $index) {
            $this->tourWithDate("datumos-{$index}", '2026-07-01', '2026-07-05', ['sort_order' => 10 + $index]);
        }

        $response = $this->callRetellFunction('search_trips')->assertOk();

        $response->assertJsonPath('total_matches', 5)
            ->assertJsonPath('returned', 3)
            ->assertJsonCount(3, 'trips');
        $this->assertCount(3, $this->recommendedTrips());
        $this->assertNotContains($onRequest->seo_name, $response->json('trips.*.slug'));
    }

    public function test_an_empty_search_says_so_and_suggests_relaxing_filters(): void
    {
        $this->tourWithDate('horvat-ut', '2026-07-10', '2026-07-15');

        $this->callRetellFunction('search_trips', ['query' => 'Antarktisz'])
            ->assertOk()
            ->assertJsonPath('total_matches', 0)
            ->assertJsonPath('trips', [])
            ->assertJsonPath('guidance', fn (string $guidance): bool => str_contains($guidance, 'No trip matches'));
        $this->assertSame([], $this->recommendedTrips());
    }

    public function test_recommended_trips_link_to_their_page_on_the_site(): void
    {
        $tour = $this->tourWithDate('dalmat-kor', '2026-07-10', '2026-07-15');

        $this->callRetellFunction('search_trips')->assertOk();
        $trip = $this->recommendedTrips()[0];

        $this->assertSame('/ajanlat/dalmat-kor', $trip['link']);
        $this->assertSame($tour->seo_name, $trip['seoName']);
        $this->getJson('/api/portfolio/offers/'.$trip['seoName'])->assertOk()->assertJsonPath('link', $trip['link']);
    }

    public function test_invalid_arguments_are_answered_with_the_fields_to_fix(): void
    {
        $this->callRetellFunction('search_trips', ['travel_mode' => 'rocket', 'departure_from' => '07/01/2026', 'max_price_per_person' => -5])
            ->assertOk()
            ->assertJsonPath('error.code', 'invalid_arguments')
            ->assertJsonStructure(['error' => ['message', 'details' => ['errors' => ['travel_mode', 'departure_from', 'max_price_per_person']]]])
            ->assertJsonPath('error.details.errors.travel_mode.0', 'The selected travel_mode is invalid.');

        $this->callRetellFunction('search_trips', ['departure_from' => '2026-08-01', 'departure_until' => '2026-07-01'])
            ->assertOk()
            ->assertJsonPath('error.code', 'invalid_date_range');

        $this->callRetellFunction('get_trip_price', ['slug' => 'valami', 'passengers' => 0])
            ->assertOk()
            ->assertJsonStructure(['error' => ['details' => ['errors' => ['passengers']]]]);

        foreach ([
            ['get_trip_price', ['slug' => 'valami', 'passengers' => 21]],
            ['get_trip_details', []],
            ['get_trip_details', ['slug' => '../admin']],
            ['get_trip_details', ['slug' => ['array']]],
        ] as [$tool, $arguments]) {
            $this->callRetellFunction($tool, $arguments)->assertOk()->assertJsonPath('error.code', 'invalid_arguments');
        }
    }

    public function test_unknown_tools_and_arguments_are_refused_or_dropped(): void
    {
        $this->callRetellFunction('create_booking', ['slug' => 'x'])
            ->assertOk()
            ->assertJsonPath('error.code', 'unknown_tool');

        // An argument the tool does not define never reaches the catalog query.
        $this->tourWithDate('rejtett', '2026-07-10', '2026-07-15', ['listed' => false]);
        $this->callRetellFunction('search_trips', ['listed' => false, 'perPage' => 500])
            ->assertOk()
            ->assertJsonPath('total_matches', 0);
    }

    public function test_a_trip_that_is_not_offered_is_not_found(): void
    {
        $this->tour('inaktiv', ['active' => false]);

        foreach (['get_trip_details', 'get_trip_departures', 'get_pickup_locations'] as $tool) {
            $this->callRetellFunction($tool, ['slug' => 'inaktiv'])
                ->assertOk()
                ->assertJsonPath('error.code', 'trip_not_found');
        }

        $this->callRetellFunction('get_trip_price', ['slug' => 'nincs-ilyen', 'passengers' => 2])
            ->assertOk()
            ->assertJsonPath('error.code', 'trip_not_found');
    }

    public function test_trip_details_describe_program_stay_and_price_inclusions(): void
    {
        $tour = $this->tourWithDate('toszkana', '2026-07-10', '2026-07-15', [
            'accommodation' => 'hotel***',
            'catering' => 'félpanzió',
            'short_description' => '<p>Firenze &amp; Siena</p>',
        ]);
        $tour->programDays()->create(['day_number' => 1, 'title' => 'Indulás <b>Budapestről</b>', 'sort_order' => 1, 'active' => true]);
        $tour->programDays()->create(['day_number' => 2, 'title' => 'Rejtett nap', 'sort_order' => 2, 'active' => false]);
        $tour->priceItems()->create(['type' => 'included', 'text' => 'Szállás', 'sort_order' => 1, 'active' => true]);
        $tour->priceItems()->create(['type' => 'excluded', 'text' => 'Belépők', 'sort_order' => 2, 'active' => true]);

        $this->callRetellFunction('get_trip_details', ['slug' => 'toszkana'])
            ->assertOk()
            ->assertJsonPath('summary', 'Firenze & Siena')
            ->assertJsonPath('accommodation', 'Hotel***')
            ->assertJsonPath('meals', 'Félpanzió')
            ->assertJsonPath('program', ['1. nap: Indulás Budapestről'])
            ->assertJsonPath('price_includes', ['Szállás'])
            ->assertJsonPath('price_excludes', ['Belépők']);
        $this->assertSame('/ajanlat/toszkana', $this->recommendedTrips()[0]['link']);
    }

    public function test_departures_report_catalog_availability_without_confirming_it(): void
    {
        $tour = $this->tourWithDate('velence', '2026-07-10', '2026-07-12');
        TourDate::query()->where('tour_id', $tour->id)->update(['price_box_available_seats' => 4]);
        TourDate::factory()->create(['tour_id' => $tour->id, 'start_date' => '2026-08-10', 'end_date' => '2026-08-12', 'status' => 'sold_out']);
        TourDate::factory()->create(['tour_id' => $tour->id, 'start_date' => '2026-05-10', 'end_date' => '2026-05-12']);

        $response = $this->callRetellFunction('get_trip_departures', ['slug' => 'velence'])->assertOk();

        $response->assertJsonPath('total_upcoming', 2)
            ->assertJsonPath('departures.0.start_date', '2026-07-10')
            ->assertJsonPath('departures.0.availability.bookable', true)
            ->assertJsonPath('departures.0.availability.seats_left', 4)
            ->assertJsonPath('departures.0.availability.confirmed', false)
            ->assertJsonPath('departures.0.availability.source', 'catalog')
            ->assertJsonPath('departures.1.availability.status', 'sold_out')
            ->assertJsonPath('departures.1.availability.bookable', false)
            ->assertJsonPath('departures.1.availability.seats_left', null);
    }

    public function test_a_trip_without_scheduled_departures_is_reported_as_on_request(): void
    {
        $this->tour('keresre');

        $this->callRetellFunction('get_trip_departures', ['slug' => 'keresre'])
            ->assertOk()
            ->assertJsonPath('total_upcoming', 0)
            ->assertJsonPath('departures', [])
            ->assertJsonPath('guidance', fn (string $guidance): bool => str_contains($guidance, 'on request'));
    }

    public function test_a_trip_without_a_price_is_never_priced(): void
    {
        $tour = $this->tour('ar-nelkul', ['price' => null, 'price_box_price' => null]);
        TourDate::factory()->create(['tour_id' => $tour->id, 'start_date' => '2026-07-10', 'end_date' => '2026-07-12', 'price' => null]);

        $this->callRetellFunction('get_trip_departures', ['slug' => 'ar-nelkul'])
            ->assertOk()
            ->assertJsonPath('departures.0.price_per_person', null);

        $departureId = $tour->dates()->value('id');

        $this->callRetellFunction('get_trip_price', ['slug' => 'ar-nelkul', 'passengers' => 2, 'departure_id' => $departureId])
            ->assertOk()
            ->assertJsonPath('price_available', false)
            ->assertJsonMissingPath('total');
    }

    public function test_prices_not_updated_for_a_long_time_are_flagged_as_possibly_outdated(): void
    {
        config(['sales_assistant.stale_after_days' => 30]);
        $fresh = $this->tourWithDate('friss', '2026-07-10', '2026-07-12');
        $stale = $this->tourWithDate('regi', '2026-07-10', '2026-07-12');
        // The departure's own price, last edited 45 days ago.
        TourDate::query()->where('tour_id', $stale->id)->update(['price' => 99000, 'updated_at' => now()->subDays(45)]);

        $this->callRetellFunction('get_trip_departures', ['slug' => $fresh->seo_name])
            ->assertJsonPath('departures.0.price_per_person.may_be_outdated', false);

        $this->callRetellFunction('get_trip_departures', ['slug' => $stale->seo_name])
            ->assertJsonPath('departures.0.price_per_person.may_be_outdated', true)
            ->assertJsonPath('departures.0.price_per_person.last_updated', '2026-04-17')
            ->assertJsonPath('departures.0.availability.may_be_outdated', true);
    }

    public function test_the_price_is_calculated_like_the_booking_calculates_it(): void
    {
        $tour = $this->tour('dolomitok', ['price' => 100000, 'price_box_currency' => 'HUF']);
        $date = TourDate::factory()->create([
            'tour_id' => $tour->id,
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-14',
            'price' => 120000,
            'price_box_discount_badge' => '-10%',
        ]);
        $budapest = TourDeparturePlace::factory()->create(['name' => 'Budapest', 'fee' => 0]);
        $tour->departurePlaces()->attach($budapest->id, ['fee' => 5000]);
        $this->extra($date, 'Idegenforgalmi adó', 3000, TourExtraChargeRule::MANDATORY);
        $this->extra($date, 'Városi adó', 5, TourExtraChargeRule::MANDATORY, 'EUR');
        $this->extra($date, 'Vacsora', 9000, TourExtraChargeRule::OPTIONAL);

        $this->callRetellFunction('get_trip_price', [
            'slug' => 'dolomitok',
            'passengers' => 2,
            'departure_id' => $date->id,
            'pickup_location_id' => $budapest->id,
        ])
            ->assertOk()
            ->assertJsonPath('price_available', true)
            ->assertJsonPath('price_per_person', 120000)
            ->assertJsonPath('base_total', 240000)
            ->assertJsonPath('discount.amount', 24000)
            ->assertJsonPath('pickup_location.total', 10000)
            ->assertJsonPath('mandatory_extras.0.total', 6000)
            ->assertJsonPath('paid_on_site.0.currency', 'EUR')
            ->assertJsonPath('optional_extras_not_included.0.name', 'Vacsora')
            ->assertJsonPath('total', 232000)
            ->assertJsonPath('binding_quote', false)
            ->assertJsonPath('source', 'catalog');
    }

    public function test_pricing_asks_for_the_missing_departure_or_pickup_location(): void
    {
        $tour = $this->tourWithDate('prága', '2026-07-10', '2026-07-12');
        $date = $tour->dates()->first();
        $place = TourDeparturePlace::factory()->create(['name' => 'Győr']);
        $tour->departurePlaces()->attach($place->id);

        $this->callRetellFunction('get_trip_price', ['slug' => $tour->seo_name, 'passengers' => 2])
            ->assertOk()
            ->assertJsonPath('error.code', 'departure_required')
            ->assertJsonPath('error.details.departures.0.departure_id', $date->id);

        $this->callRetellFunction('get_trip_price', ['slug' => $tour->seo_name, 'passengers' => 2, 'departure_id' => $date->id])
            ->assertOk()
            ->assertJsonPath('error.code', 'pickup_location_required')
            ->assertJsonPath('error.details.pickup_locations.0.pickup_location_id', $place->id);

        $this->callRetellFunction('get_trip_price', ['slug' => $tour->seo_name, 'passengers' => 2, 'departure_id' => 999999])
            ->assertOk()
            ->assertJsonPath('error.code', 'departure_not_found');
    }

    public function test_a_sold_out_departure_is_not_priced(): void
    {
        $tour = $this->tourWithDate('betelt', '2026-07-10', '2026-07-12', [], 'sold_out');

        $this->callRetellFunction('get_trip_price', ['slug' => 'betelt', 'passengers' => 1, 'departure_id' => $tour->dates()->value('id')])
            ->assertOk()
            ->assertJsonPath('error.code', 'departure_not_bookable');
    }

    public function test_pickup_locations_list_active_places_with_the_trip_fee(): void
    {
        $tour = $this->tourWithDate('becs', '2026-07-10', '2026-07-12');
        $date = $tour->dates()->first();
        $budapest = TourDeparturePlace::factory()->create(['name' => 'Budapest', 'fee' => 1000]);
        $gyor = TourDeparturePlace::factory()->create(['name' => 'Győr', 'fee' => 2000]);
        $closed = TourDeparturePlace::factory()->create(['name' => 'Bezárt', 'active' => false]);
        $tour->departurePlaces()->attach([$budapest->id => ['fee' => 3500], $gyor->id => ['fee' => null], $closed->id => ['fee' => null]]);

        $this->callRetellFunction('get_pickup_locations', ['slug' => 'becs'])
            ->assertOk()
            ->assertJsonPath('pickup_required', true)
            ->assertJsonPath('pickup_locations.*.name', ['Budapest', 'Győr'])
            ->assertJsonPath('pickup_locations.0.fee_per_person.amount', 3500)
            ->assertJsonPath('pickup_locations.1.fee_per_person.amount', 2000);

        $date->update(['departure_place_ids' => [$gyor->id]]);

        $this->callRetellFunction('get_pickup_locations', ['slug' => 'becs', 'departure_id' => $date->id])
            ->assertOk()
            ->assertJsonPath('pickup_locations.*.name', ['Győr']);
    }

    public function test_an_unexpected_tool_failure_is_reported_and_answered_generically(): void
    {
        Exceptions::fake();
        $this->mock(SearchTripsTool::class, function (MockInterface $tool): void {
            $tool->shouldReceive('name')->andReturn('search_trips');
            $tool->shouldReceive('rules')->andReturn([]);
            $tool->shouldReceive('handle')->andThrow(new RuntimeException('SQLSTATE[HY000]: connection lost'));
        });

        $response = $this->callRetellFunction('search_trips')
            ->assertOk()
            ->assertJsonPath('error.code', 'tool_failed');

        $this->assertStringNotContainsString('SQLSTATE', $response->getContent());
        Exceptions::assertReported(RuntimeException::class);
    }

    public function test_tool_results_never_expose_internal_catalog_fields(): void
    {
        $this->tourWithDate('belso', '2026-07-10', '2026-07-12', ['partner_xml' => ['secret' => 'x'], 'notes' => 'belső megjegyzés']);

        $content = $this->callRetellFunction('get_trip_details', ['slug' => 'belso'])->assertOk()->getContent();

        $this->assertStringNotContainsString('partner', $content);
        $this->assertStringNotContainsString('belső megjegyzés', $content);
        $this->assertStringNotContainsString('legacy', $content);
    }

    /**
     * The trip cards the demo page shows for the test call.
     *
     * @return array<int, array<string, mixed>>
     */
    private function recommendedTrips(): array
    {
        return $this->withHeader('X-Assistant-Session', $this->token)
            ->getJson('/api/sales-assistant/sessions/current/recommendations')
            ->assertOk()
            ->json('data.trips');
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function tour(string $slug, array $attributes = []): Tour
    {
        return Tour::factory()->create([
            'name' => $slug,
            'seo_name' => $slug,
            'short_description' => '',
            'list_description' => '',
            'notes' => '',
            ...$attributes,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function tourWithDate(string $slug, string $start, string $end, array $attributes = [], string $status = 'available'): Tour
    {
        $tour = $this->tour($slug, $attributes);

        TourDate::factory()->create([
            'tour_id' => $tour->id,
            'start_date' => $start,
            'end_date' => $end,
            'status' => $status,
            'price' => null,
        ]);

        return $tour;
    }

    private function extra(TourDate $date, string $name, float $price, string $chargeRule, string $currency = 'HUF'): TourDateExtra
    {
        return TourDateExtra::query()->create([
            'tour_date_id' => $date->id,
            'name' => $name,
            'price' => $price,
            'currency' => $currency,
            'price_unit' => TourExtraPriceUnit::PER_PERSON,
            'charge_rule' => $chargeRule,
            'sort_order' => 0,
        ]);
    }
}
