<?php

namespace Tests\Feature;

use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdriaImportFeaturedOffersCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.legacy_adria.base_url' => 'https://legacy.test',
            'services.legacy_adria.request_delay_ms' => 0,
        ]);
    }

    private function homepage(array $featuredSlugs): string
    {
        $items = implode('', array_map(
            fn (string $slug): string => "<div class=\"col-md-6\"><div class=\"item\"><a href=\"korutazasok/{$slug}\">{$slug}</a>"
                ."<a href=\"korutazasok/csoport/korutazas\">csoport</a></div></div>",
            $featuredSlugs,
        ));

        return '<html><body>'
            .'<section class="slider"><div class="item"><a href="korutazasok/slider-ut">Slider</a></div></section>'
            .'<section class="tours1"><div class="section-title">Kiemelt <span>Ajánlataink!</span></div>'.$items.'</section>'
            .'</body></html>';
    }

    public function test_it_features_the_legacy_homepage_offers_in_their_order(): void
    {
        Http::fake(['legacy.test/' => Http::response($this->homepage(['szlovenia', 'toszkana', 'nincs-meg-az-ujon']))]);
        $slovenia = Tour::factory()->create(['active' => true, 'seo_name' => 'szlovenia']);
        $tuscany = Tour::factory()->create(['active' => true, 'seo_name' => 'toszkana']);
        $formerlyFeatured = Tour::factory()->create(['active' => true, 'seo_name' => 'regi-kiemelt', 'featured' => true, 'featured_order' => 1]);
        Tour::factory()->create(['active' => true, 'seo_name' => 'slider-ut']);

        $this->artisan('adria:import-featured')
            ->expectsOutputToContain('Not on the new site (import it first): nincs-meg-az-ujon')
            ->assertSuccessful();

        $this->assertSame([true, 1], [$slovenia->fresh()->featured, $slovenia->fresh()->featured_order]);
        $this->assertSame([true, 2], [$tuscany->fresh()->featured, $tuscany->fresh()->featured_order]);
        $this->assertSame([false, null], [$formerlyFeatured->fresh()->featured, $formerlyFeatured->fresh()->featured_order]);

        $this->getJson('/api/portfolio/featured-tours?limit=24')
            ->assertOk()
            ->assertJsonCount(2, 'items')
            ->assertJsonPath('items.0.seoName', 'szlovenia')
            ->assertJsonPath('items.1.seoName', 'toszkana');
    }

    public function test_an_unreadable_homepage_changes_nothing(): void
    {
        Http::fake(['legacy.test/' => Http::response('<html><body>Karbantartás</body></html>')]);
        $featured = Tour::factory()->create(['active' => true, 'seo_name' => 'kiemelt', 'featured' => true, 'featured_order' => 1]);

        $this->artisan('adria:import-featured')->assertFailed();

        $this->assertTrue($featured->fresh()->featured);
    }
}
