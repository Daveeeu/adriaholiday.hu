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

    public function test_the_travel_club_pages_keep_their_legacy_urls(): void
    {
        $this->assertStringContainsString(
            '<title data-rh="true">Utazási Klub | Adria Holiday</title>',
            $this->visit('/utazasi-klub')->assertOk()->getContent(),
        );
        $this->assertStringContainsString(
            'rel="canonical" href="'.self::SITE.'/adria-holiday-utazasi-klub-felhasznalasi-feltetelei"',
            $this->visit('/adria-holiday-utazasi-klub-felhasznalasi-feltetelei')->assertOk()->getContent(),
        );
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

    public function test_an_offer_with_its_own_seo_title_description_and_robots_uses_them(): void
    {
        Tour::factory()->create([
            'active' => true,
            'name' => 'Advent Mariazellben',
            'seo_name' => 'advent-mariazellben',
            'seo_title' => 'Advent Mariazellben buszos úttal',
            'seo_description' => 'Adventi kirándulás Mariazellbe busszal, idegenvezetéssel.',
            'seo_robots' => 'noindex, follow',
        ]);
        Tour::factory()->create(['active' => true, 'name' => 'Advent Grazban', 'seo_name' => 'advent-grazban', 'seo_robots' => 'index, follow']);

        $html = $this->visit('/ajanlat/advent-mariazellben')->assertOk()->getContent();
        $this->assertStringContainsString('<title data-rh="true">Advent Mariazellben buszos úttal | Adria Holiday</title>', $html);
        $this->assertStringContainsString('content="Adventi kirándulás Mariazellbe busszal, idegenvezetéssel."', $html);
        $this->assertStringContainsString('name="robots" content="noindex,follow"', $html);

        // "index, follow" is the default; a host never indexed stays so.
        $this->assertStringContainsString('content="index,follow,max-image-preview:large"', $this->visit('/ajanlat/advent-grazban')->getContent());
        $this->assertStringContainsString('content="noindex,nofollow"', $this->visit('/ajanlat/advent-grazban', 'adriaholiday.jandldavid.hu')->getContent());
    }

    public function test_missing_content_and_unknown_paths_answer_404_and_are_not_indexed(): void
    {
        Tour::factory()->create(['active' => false, 'seo_name' => 'inaktiv-ut']);

        foreach (['/ajanlat/inaktiv-ut', '/ajanlat/nincs-ilyen', '/blog/nincs-ilyen', '/kategoriak/nincs-ilyen', '/regiok/nincs-ilyen', '/nincs-ilyen-oldal'] as $path) {
            $this->assertStringContainsString('noindex,nofollow', $this->visit($path)->assertNotFound()->getContent(), $path);
        }
    }

    public function test_the_ai_assistant_demo_page_is_never_indexed_and_hidden_while_switched_off(): void
    {
        config(['sales_assistant.enabled' => false]);
        $this->visit('/ai-utazasi-tanacsado')->assertNotFound();

        config(['sales_assistant.enabled' => true]);
        $content = $this->visit('/ai-utazasi-tanacsado')->assertOk()->getContent();

        $this->assertStringContainsString('AI utazási tanácsadó (demó)', $content);
        $this->assertStringContainsString('noindex,nofollow', $content);
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

    public function test_legacy_site_urls_redirect_to_their_new_pages(): void
    {
        $redirects = [
            '/korutazasok/latogatas-portugaliaban' => '/ajanlat/latogatas-portugaliaban',
            '/korutazasok/csoport/korutazas' => '/kategoriak/korutazasok',
            '/korutazasok/csoport/korutazas/albania' => '/kategoriak/korutazasok',
            '/korutazasok/csoport/tengerparti-udulesek/albania' => '/kategoriak/tengerpartok',
            '/korutazasok/csoport/advent/ausztria' => '/kategoriak/adventi-barangolasok',
            '/korutazasok/regio/Szlov%C3%A1kia' => '/utazasok',
            '/korutazasok/akcio' => '/utazasok',
            '/altalanos-szerzodesi-feltetelek' => '/aszf',
            '/adatkezelesi-szabalyzat' => '/adatvedelem',
        ];

        foreach ($redirects as $from => $to) {
            $this->visit($from)->assertStatus(301)->assertRedirect($to);
        }
    }

    public function test_the_insurance_page_and_the_legacy_contract_information_url_work(): void
    {
        $this->assertStringContainsString(
            '<title data-rh="true">Biztosítások | Adria Holiday</title>',
            $this->visit('/biztositasok')->assertOk()->getContent(),
        );
        $this->visit('/utazasi-szerzodeshez-kapcsolodo-tajekoztato')->assertStatus(301)->assertRedirect('/aszf');
    }

    public function test_the_former_portfolio_duplicate_redirects_home(): void
    {
        $this->visit('/portfolio')->assertRedirect('/')->assertStatus(301);
    }
}
