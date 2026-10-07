<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdriaImportOffersCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.legacy_adria.base_url' => 'https://legacy.test',
            'services.legacy_adria.request_delay_ms' => 0,
        ]);

        Http::fake([
            // School trips are active on the legacy site but no listing page links them.
            'legacy.test/' => Http::response('<html><body><a href="korutazasok/csoport/korutazas">Körutazások</a></body></html>'),
            'legacy.test/korutazasok/csoport/korutazas' => Http::response('<html><body></body></html>'),
            'legacy.test/korutazasok/bakonyi-betyarkodas-1-nap' => Http::response(
                '<html><body><h1>Bakonyi betyárkodás 1 nap</h1><div class="program-content">'
                .'<p>1. NAP<br>Indulás a Bakonyba.</p>'
                .'</div></body></html>',
            ),
        ]);
    }

    public function test_selected_offers_listed_nowhere_take_their_context_from_the_options(): void
    {
        $this->artisan('adria:import-offers', [
            '--slug' => ['bakonyi-betyarkodas-1-nap'],
            '--country' => ['belfold'],
            '--category' => ['osztalykirandulas'],
        ])->assertSuccessful();

        $tour = Tour::query()->where('seo_name', 'bakonyi-betyarkodas-1-nap')->firstOrFail();
        $this->assertSame(['hu'], $tour->country_ids);
        $this->assertSame(
            [(string) BlogCategory::query()->where('seo_name', 'osztalykirandulasok')->value('id')],
            $tour->category_ids,
        );
        $this->assertSame('Indulás a Bakonyba.', $tour->programDays()->firstOrFail()->description);
    }
}
