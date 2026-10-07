<?php

namespace Tests\Feature;

use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PortfolioSeoTest extends TestCase
{
    use RefreshDatabase;

    private const SITE = 'https://adriaholiday.hu';

    protected function setUp(): void
    {
        parent::setUp();

        config(['seo.site_url' => self::SITE]);
    }

    private function visit(string $path, string $host = 'adriaholiday.hu'): TestResponse
    {
        return $this->get("https://{$host}{$path}");
    }

    public function test_each_page_gets_its_own_title_canonical_and_a_single_set_of_tags(): void
    {
        $html = $this->visit('/rolunk')->assertOk()->getContent();

        $this->assertStringContainsString('<title data-rh="true">Rólunk | Adria Holiday</title>', $html);
        $this->assertStringContainsString('<link data-rh="true" rel="canonical" href="'.self::SITE.'/rolunk">', $html);
        $this->assertStringContainsString('content="index,follow,max-image-preview:large"', $html);
        $this->assertSame(1, substr_count($html, 'rel="canonical"'));
        $this->assertSame(1, substr_count($html, '<title'));
        $this->assertSame(1, substr_count($html, 'name="description"'));
    }

    public function test_an_offer_page_describes_the_trip_with_structured_data(): void
    {
        Tour::factory()->create([
            'active' => true,
            'name' => 'Portugália felfedezése',
            'seo_name' => 'latogatas-portugaliaban',
            'short_description' => '<p>Porto - Coimbra - Lisszabon</p>',
            'price' => 288600,
        ]);

        $html = $this->visit('/ajanlat/latogatas-portugaliaban')->assertOk()->getContent();

        $this->assertStringContainsString('Portugália felfedezése | Adria Holiday', $html);
        $this->assertStringContainsString('content="Porto - Coimbra - Lisszabon"', $html);
        $this->assertStringContainsString('"@type":"TouristTrip"', $html);
        $this->assertStringContainsString('"price":288600', $html);
        $this->assertStringContainsString('"@type":"BreadcrumbList"', $html);
    }

    public function test_missing_content_and_unknown_paths_answer_404_and_are_not_indexed(): void
    {
        Tour::factory()->create(['active' => false, 'seo_name' => 'inaktiv-ut']);

        foreach (['/ajanlat/inaktiv-ut', '/ajanlat/nincs-ilyen', '/blog/nincs-ilyen', '/kategoriak/nincs-ilyen', '/regiok/nincs-ilyen', '/nincs-ilyen-oldal'] as $path) {
            $this->assertStringContainsString('noindex,nofollow', $this->visit($path)->assertNotFound()->getContent(), $path);
        }
    }

    public function test_other_hosts_are_never_indexed_but_point_to_the_canonical_site(): void
    {
        $response = $this->visit('/rolunk', 'adriaholiday.jandldavid.hu')->assertOk();

        $response->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->assertStringContainsString('content="noindex,nofollow"', $response->getContent());
        $this->assertStringContainsString('href="'.self::SITE.'/rolunk"', $response->getContent());
    }

    public function test_robots_txt_opens_only_the_canonical_host(): void
    {
        $canonical = $this->visit('/robots.txt')->assertOk()->getContent();
        $staging = $this->visit('/robots.txt', 'adriaholiday.jandldavid.hu')->assertOk()->getContent();

        $this->assertStringContainsString("Allow: /\n", $canonical);
        $this->assertStringContainsString('Sitemap: '.self::SITE.'/sitemap.xml', $canonical);
        $this->assertStringContainsString("Disallow: /\n", $staging);
        $this->assertStringNotContainsString('Allow: /', $staging);
    }

    public function test_the_former_portfolio_duplicate_redirects_home(): void
    {
        $this->visit('/portfolio')->assertRedirect('/')->assertStatus(301);
    }
}
