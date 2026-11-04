<?php

namespace Tests\Feature;

use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioRelatedOffersTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_offers_most_like_the_viewed_trip_come_first(): void
    {
        $this->tour('zakopane', categories: ['advent'], countries: ['PL']);
        $this->tour('krakko', categories: ['advent'], countries: ['PL']);
        $this->tour('lengyel-kor', categories: ['korutazas'], countries: ['PL']);
        $this->tour('becs-advent', categories: ['advent'], countries: ['AT']);
        $this->tour('horvat-tenger', categories: ['tengerpart'], countries: ['HR']);
        $this->tour('rejtett', categories: ['advent'], countries: ['PL'], listed: false);

        $this->assertSame(['krakko', 'lengyel-kor', 'becs-advent', 'horvat-tenger'], $this->related('zakopane'));
    }

    public function test_earlier_views_get_every_third_place_and_seen_trips_rank_lower(): void
    {
        $this->tour('zakopane', categories: ['advent'], countries: ['PL']);
        $this->tour('krakko', categories: ['advent'], countries: ['PL']);
        $this->tour('tatra', categories: ['advent'], countries: ['PL', 'SK']);
        $this->tour('lengyel-kor', categories: ['korutazas'], countries: ['PL']);
        $this->tour('london', categories: ['varoslatogatas'], countries: ['GB']);
        $this->tour('anglia-videk', categories: ['varoslatogatas'], countries: ['GB']);

        $this->assertSame(
            ['krakko', 'tatra', 'anglia-videk', 'lengyel-kor', 'london'],
            $this->related('zakopane', ['london', 'nem-letezik']),
        );

        // A tour seen before ranks after a similar unseen one.
        $this->assertSame('tatra', $this->related('zakopane', ['krakko'])[0]);
    }

    public function test_without_upcoming_dates_a_tour_ranks_lower(): void
    {
        $this->tour('zakopane', categories: ['advent'], countries: ['PL']);
        $this->tour('krakko', categories: ['advent'], countries: ['PL'], withDate: false);
        $this->tour('tatra', categories: ['advent'], countries: ['PL']);

        $this->assertSame(['tatra', 'krakko'], $this->related('zakopane'));
    }

    public function test_unknown_trips_and_malformed_views_are_rejected(): void
    {
        $this->tour('zakopane', categories: ['advent'], countries: ['PL']);

        $this->getJson('/api/portfolio/offers/nincs-ilyen/related')->assertNotFound();
        $this->getJson('/api/portfolio/offers/zakopane/related?viewed=<script>')->assertStatus(422);
        $this->getJson('/api/portfolio/offers/zakopane/related?viewed='.implode(',', range(1, 11)))->assertStatus(422);
    }

    /**
     * @param  array<int, string>  $viewed
     * @return array<int, string>
     */
    private function related(string $slug, array $viewed = []): array
    {
        $query = $viewed !== [] ? '?viewed='.implode(',', $viewed) : '';

        return array_column($this->getJson("/api/portfolio/offers/{$slug}/related{$query}")->assertOk()->json('items'), 'seoName');
    }

    /**
     * @param  array<int, string>  $categories
     * @param  array<int, string>  $countries
     */
    private function tour(string $slug, array $categories, array $countries, bool $listed = true, bool $withDate = true): Tour
    {
        $tour = Tour::factory()->create([
            'seo_name' => $slug,
            'active' => true,
            'listed' => $listed,
            'featured' => false,
            'sort_order' => 1,
            'category_ids' => $categories,
            'country_ids' => $countries,
            'region_id' => null,
            'travel_mode_id' => null,
            'price_box_price' => null,
        ]);

        if ($withDate) {
            $tour->dates()->create(['start_date' => now()->addMonth()->toDateString(), 'end_date' => now()->addMonth()->addDays(2)->toDateString(), 'price_box_price' => 50000]);
        }

        return $tour;
    }
}
