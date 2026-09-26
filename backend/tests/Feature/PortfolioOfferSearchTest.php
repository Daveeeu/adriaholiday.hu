<?php

namespace Tests\Feature;

use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PortfolioOfferSearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-06-01 10:00:00');
    }

    public function test_search_matches_tours_by_country_name(): void
    {
        TourReferenceOption::query()->create(['type' => 'country', 'code' => 'hr', 'name' => 'Horvátország', 'active' => true, 'sort_order' => 1]);
        TourReferenceOption::query()->create(['type' => 'country', 'code' => 'it', 'name' => 'Olaszország', 'active' => true, 'sort_order' => 2]);
        $croatian = $this->tour('horvat-tengerpart', ['country_ids' => ['hr']]);
        $this->tour('olasz-varosok', ['country_ids' => ['it']]);

        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?search=horvát'), [$croatian->seo_name]);
    }

    public function test_search_matches_tours_by_region_name(): void
    {
        $region = Region::factory()->create(['name' => 'Dalmácia']);
        $dalmatian = $this->tour('dalmat-kor', ['region_id' => $region->id]);
        $this->tour('mas-ut');

        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?search=dalmácia'), [$dalmatian->seo_name]);
    }

    public function test_departure_filter_matches_active_departure_places(): void
    {
        $budapest = TourDeparturePlace::factory()->create(['name' => 'Budapest, Népliget', 'city' => 'Budapest']);
        $inactiveGyor = TourDeparturePlace::factory()->create(['name' => 'Győr', 'city' => 'Győr', 'active' => false]);
        $fromBudapest = $this->tour('budapesti-indulas');
        $fromBudapest->departurePlaces()->sync([$budapest->id]);
        $this->tour('gyori-indulas')->departurePlaces()->sync([$inactiveGyor->id]);

        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?departure=budapest'), [$fromBudapest->seo_name]);
        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?departure=győr'), []);
    }

    public function test_from_filter_only_matches_bookable_departures_on_or_after_the_date(): void
    {
        $july = $this->tourWithDate('juliusi-ut', '2026-07-10', '2026-07-15');
        $this->tourWithDate('juniusi-ut', '2026-06-10', '2026-06-15');
        $this->tourWithDate('telt-hazas-ut', '2026-07-20', '2026-07-25', 'sold_out');
        $this->tourWithDate('lemondott-ut', '2026-07-20', '2026-07-25', 'cancelled');

        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?from=2026-07-01'), [$july->seo_name]);
    }

    public function test_from_filter_never_matches_past_departures(): void
    {
        $upcoming = $this->tourWithDate('kozelgo-ut', '2026-06-20', '2026-06-22');
        $this->tourWithDate('elmult-ut', '2026-05-10', '2026-05-12');

        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?from=2026-01-01'), [$upcoming->seo_name]);
    }

    public function test_duration_filter_matches_trip_length_in_days(): void
    {
        $dayTrip = $this->tourWithDate('egynapos', '2026-07-01', '2026-07-01');
        $fourDays = $this->tourWithDate('negynapos', '2026-07-01', '2026-07-04');
        $fiveDays = $this->tourWithDate('otnapos', '2026-07-01', '2026-07-05');
        $eightDays = $this->tourWithDate('nyolcnapos', '2026-07-01', '2026-07-08');
        $nineDays = $this->tourWithDate('kilencnapos', '2026-07-01', '2026-07-09');

        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?duration=short'), [$dayTrip->seo_name, $fourDays->seo_name]);
        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?duration=medium'), [$fiveDays->seo_name, $eightDays->seo_name]);
        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?duration=long'), [$nineDays->seo_name]);
    }

    public function test_date_and_duration_must_match_the_same_departure(): void
    {
        $tour = $this->tourWithDate('ket-idopont', '2026-06-10', '2026-06-20');
        TourDate::factory()->create(['tour_id' => $tour->id, 'start_date' => '2026-08-01', 'end_date' => '2026-08-02']);

        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?from=2026-07-01&duration=long'), []);
        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?from=2026-07-01&duration=short'), [$tour->seo_name]);
    }

    public function test_invalid_search_parameters_are_ignored(): void
    {
        $tour = $this->tourWithDate('barmilyen-ut', '2026-07-01', '2026-07-03');

        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?from=2026-13-45&duration=forever'), [$tour->seo_name]);
        $this->assertOfferSlugs($this->getJson('/api/portfolio/offers?search[]=x&departure[]=y'), [$tour->seo_name]);
    }

    public function test_filter_chip_and_country_facets_respect_search_parameters(): void
    {
        TourReferenceOption::query()->create(['type' => 'country', 'code' => 'hr', 'name' => 'Horvátország', 'active' => true, 'sort_order' => 1]);
        TourReferenceOption::query()->create(['type' => 'country', 'code' => 'it', 'name' => 'Olaszország', 'active' => true, 'sort_order' => 2]);
        $this->tourWithDate('horvat-hosszu', '2026-07-01', '2026-07-10', 'planned', ['country_ids' => ['hr']]);
        $this->tourWithDate('olasz-rovid', '2026-07-01', '2026-07-02', 'planned', ['country_ids' => ['it']]);

        $response = $this->getJson('/api/portfolio/offers/countries?duration=long');

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.code', 'hr');
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
    private function tourWithDate(string $slug, string $start, string $end, string $status = 'planned', array $attributes = []): Tour
    {
        $tour = $this->tour($slug, $attributes);

        TourDate::factory()->create([
            'tour_id' => $tour->id,
            'start_date' => $start,
            'end_date' => $end,
            'status' => $status,
        ]);

        return $tour;
    }

    /**
     * @param  array<int, string>  $expectedSlugs
     */
    private function assertOfferSlugs(TestResponse $response, array $expectedSlugs): void
    {
        $response->assertOk();

        $actualSlugs = collect($response->json('items'))->pluck('seoName')->sort()->values()->all();

        $this->assertSame(collect($expectedSlugs)->sort()->values()->all(), $actualSlugs);
    }
}
