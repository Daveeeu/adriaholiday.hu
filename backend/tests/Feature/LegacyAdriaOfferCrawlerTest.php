<?php

namespace Tests\Feature;

use App\Services\Legacy\LegacyAdriaOfferCrawler;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LegacyAdriaOfferCrawlerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.legacy_adria.base_url' => 'https://legacy.test',
            'services.legacy_adria.request_delay_ms' => 0,
        ]);

        Http::fake([
            'legacy.test/korutazasok/csoport/korutazas' => Http::response($this->listing([
                'korutazasok/csoport/korutazas/spanyolorszag',
                'korutazasok/csoport/korutazas/marokko',
            ])),
            'legacy.test/korutazasok/csoport/korutazas/spanyolorszag' => Http::response($this->offers([
                'korutazasok/spanyolorszag-es-marokko-varazsa',
                'korutazasok/madridi-hangulatok',
            ])),
            'legacy.test/korutazasok/csoport/korutazas/marokko' => Http::response($this->offers([
                'korutazasok/spanyolorszag-es-marokko-varazsa',
            ])),
            'legacy.test/korutazasok/csoport/tengerparti-udulesek' => Http::response($this->listing([
                'korutazasok/csoport/tengerparti-udulesek/albania',
            ])),
            'legacy.test/korutazasok/csoport/tengerparti-udulesek/albania' => Http::response($this->offers([
                'korutazasok/a-sorrentoi-felsziget-csodai-(hotel)',
            ])),
        ]);
    }

    public function test_it_resolves_every_country_and_category_an_offer_is_listed_under(): void
    {
        $crawler = app(LegacyAdriaOfferCrawler::class);

        $context = $crawler->discoverOfferContext($crawler->offerUrlForSlug('spanyolorszag-es-marokko-varazsa'));

        $this->assertSame(['spanyolorszag', 'marokko'], $context['countries']);
        $this->assertSame(['korutazas'], $context['categories']);
    }

    public function test_it_matches_an_offer_url_regardless_of_percent_encoding(): void
    {
        $crawler = app(LegacyAdriaOfferCrawler::class);

        $context = $crawler->discoverOfferContext('https://legacy.test/korutazasok/a-sorrentoi-felsziget-csodai-%28hotel%29');

        $this->assertSame(['albania'], $context['countries']);
        $this->assertSame(['tengerparti-udulesek'], $context['categories']);
    }

    public function test_an_offer_missing_from_every_listing_page_has_an_empty_context(): void
    {
        $crawler = app(LegacyAdriaOfferCrawler::class);

        $context = $crawler->discoverOfferContext($crawler->offerUrlForSlug('unlisted-offer'));

        $this->assertSame(['countries' => [], 'categories' => []], $context);
    }

    /**
     * @param  array<int, string>  $paths
     */
    private function listing(array $paths): string
    {
        return '<html><body>'.implode('', array_map(fn (string $path): string => "<a href=\"{$path}\">{$path}</a>", $paths)).'</body></html>';
    }

    /**
     * @param  array<int, string>  $paths
     */
    private function offers(array $paths): string
    {
        return '<html><body>'.implode('', array_map(fn (string $path): string => "<div class=\"item\"><a href=\"{$path}\">{$path}</a></div>", $paths)).'</body></html>';
    }
}
