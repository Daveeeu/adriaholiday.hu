<?php

namespace Tests\Feature;

use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TourShortDescriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_html_in_the_route_line_is_saved_as_plain_text(): void
    {
        $tour = Tour::factory()->create(['short_description' => "<p>Krakkó-Wieliczka-\n Poronin &amp; Zakopane</p>"]);

        $this->assertSame('Krakkó-Wieliczka- Poronin & Zakopane', $tour->fresh()->short_description);
    }

    public function test_an_empty_route_line_is_saved_as_null(): void
    {
        $tour = Tour::factory()->create(['short_description' => '<p> </p>']);

        $this->assertNull($tour->fresh()->short_description);
    }

    public function test_offer_cards_show_the_route_line_without_html(): void
    {
        Tour::factory()->create([
            'active' => true,
            'listed' => true,
            'seo_name' => 'lengyelorszagi-kalandozasok',
            'short_description' => '<p>Krakkó-Wieliczka-Poronin-Zakopane</p>',
        ]);

        $this->getJson('/api/portfolio/offers')
            ->assertOk()
            ->assertJsonPath('items.0.shortDescription', 'Krakkó-Wieliczka-Poronin-Zakopane');
    }
}
