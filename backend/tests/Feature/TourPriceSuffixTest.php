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
        $tour = Tour::factory()->create(['price_box_price' => 276900]);

        $this->assertSame('/ fő', $tour->refresh()->price_box_price_suffix);
        $this->assertSame('276.900 Ft / fő', PriceBoxData::fromTour($tour)['displayedPrice']);
    }

    public function test_the_offer_card_shows_the_price_without_the_suffix_it_adds_itself(): void
    {
        $tour = Tour::factory()->create(['price_box_price' => 276900, 'price_box_price_suffix' => '/ fő']);

        $card = (new PortfolioFeaturedTourResource($tour->load('dates')))->toArray(new Request);

        $this->assertSame('276.900 Ft', $card['displayedPrice']);
    }

    public function test_a_date_shows_its_own_price_and_its_struck_through_original_one(): void
    {
        $tour = Tour::factory()->create();
        $date = $tour->dates()->create(['start_date' => '2027-07-04', 'end_date' => '2027-07-11', 'price' => 289900, 'price_box_price' => 289900, 'price_box_original_price' => 338600]);

        $priceBox = PriceBoxData::fromDate($date);

        $this->assertSame('289.900 Ft', $priceBox['displayedPrice']);
        $this->assertSame('338.600 Ft', $priceBox['originalDisplayedPrice']);
    }
}
