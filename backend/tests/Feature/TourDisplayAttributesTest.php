<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\TourReferenceOption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TourDisplayAttributesTest extends TestCase
{
    use RefreshDatabase;

    private function flightTour(array $attributes = []): Tour
    {
        $tour = Tour::factory()->create([
            'active' => true,
            'seo_name' => 'repulos-korut',
            'travel_mode_id' => 'plane',
            'catering' => 'félpanzió',
            'accommodation' => 'Hotel***/****',
            'notes' => '<p>Útlevél szükséges.</p>',
            'country_ids' => ['es', 'ma'],
            ...$attributes,
        ]);
        $tour->dates()->create(['start_date' => '2026-10-17', 'end_date' => '2026-10-24', 'price' => 724600]);

        return $tour;
    }

    public function test_offer_detail_shows_the_tours_structured_attributes(): void
    {
        TourReferenceOption::query()->create(['type' => 'country', 'code' => 'es', 'name' => 'Spanyolország', 'active' => true, 'sort_order' => 1]);
        TourReferenceOption::query()->create(['type' => 'country', 'code' => 'ma', 'name' => 'Marokkó', 'active' => true, 'sort_order' => 2]);
        $this->flightTour();

        $this->getJson('/api/portfolio/offers/repulos-korut')
            ->assertOk()
            ->assertJsonPath('transport', 'plane')
            ->assertJsonPath('meals', 'Félpanzió')
            ->assertJsonPath('accommodation', 'Hotel***/****')
            ->assertJsonPath('duration', '8 nap / 7 éj')
            ->assertJsonPath('country', 'Spanyolország, Marokkó');
    }

    public function test_offer_list_shows_the_tours_structured_attributes(): void
    {
        $this->flightTour();

        $this->getJson('/api/portfolio/offers?search=repulos')
            ->assertOk()
            ->assertJsonPath('items.0.seoName', 'repulos-korut')
            ->assertJsonPath('items.0.transport', 'plane')
            ->assertJsonPath('items.0.meals', 'Félpanzió')
            ->assertJsonPath('items.0.accommodation', 'Hotel***/****')
            ->assertJsonPath('items.0.duration', '8 nap / 7 éj');
    }

    public function test_attributes_fall_back_to_the_legacy_notes_blob(): void
    {
        $this->flightTour([
            'travel_mode_id' => null,
            'catering' => null,
            'accommodation' => null,
            'notes' => json_encode(['transport' => 'bus', 'meals' => 'reggeli', 'accommodation' => 'Apartman']),
        ]);

        $this->getJson('/api/portfolio/offers/repulos-korut')
            ->assertOk()
            ->assertJsonPath('transport', 'bus')
            ->assertJsonPath('meals', 'Reggeli')
            ->assertJsonPath('accommodation', 'Apartman');
    }
}
