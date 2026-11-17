<?php

namespace Tests\Feature;

use App\Http\Resources\PortfolioFeaturedTourResource;
use App\Models\Tour;
use App\Support\PriceBoxData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class TourPriceSuffixTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_tour_saved_without_a_price_suffix_is_priced_per_person(): void
    {
        $tour = Tour::factory()->create(['price_box_price' => 276900, 'displayed_price' => null]);

        $this->assertSame('/ fő', $tour->refresh()->price_box_price_suffix);
        $this->assertSame('276.900 Ft / fő', PriceBoxData::fromTour($tour)['displayedPrice']);
    }

    public function test_the_offer_card_shows_the_price_without_the_suffix_it_adds_itself(): void
    {
        $tour = Tour::factory()->create(['price_box_price' => 276900, 'displayed_price' => null, 'price_box_price_suffix' => '/ fő']);

        $card = (new PortfolioFeaturedTourResource($tour->load('dates')))->toArray(new Request);

        $this->assertSame('276.900 Ft', $card['displayedPrice']);
    }

    public function test_a_written_price_text_is_kept_as_it_is(): void
    {
        $tour = Tour::factory()->create(['price_box_price' => 276900, 'price_box_displayed_price' => '276 900 Ft/fő-től']);

        $this->assertSame('276.900 Ft/fő-től', PriceBoxData::fromTour($tour)['displayedPrice']);
        $this->assertSame('276.900 Ft/fő-től', PriceBoxData::fromTour($tour, withSuffix: false)['displayedPrice']);
    }
}
