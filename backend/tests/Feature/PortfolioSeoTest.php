<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\BlogArticle;
use App\Models\BlogArticleTranslation;
use App\Models\BlogCategory;
use App\Models\Location;
use App\Models\SeoRedirect;
use App\Models\Tour;
use App\Support\Seo\PublicSiteUrl;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
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
        foreach (['/ajanlat/nincs-ilyen', '/apartman/nincs-ilyen', '/blog/nincs-ilyen', '/kategoriak/nincs-ilyen', '/regiok/nincs-ilyen', '/nincs-ilyen-oldal'] as $path) {
            $this->assertStringContainsString('noindex,nofollow', $this->visit($path)->assertNotFound()->getContent(), $path);
        }
    }

    public function test_the_ai_assistant_demo_page_is_never_indexed_and_hidden_while_it_or_its_page_is_off(): void
    {
        config(['sales_assistant.enabled' => false]);
        $this->visit('/ai-utazasi-tanacsado')->assertNotFound();

        config(['sales_assistant.enabled' => true, 'sales_assistant.demo_page_enabled' => false]);
        $this->visit('/ai-utazasi-tanacsado')->assertNotFound();

        config(['sales_assistant.demo_page_enabled' => true]);
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

    public function test_robots_txt_lets_crawlers_load_the_public_content_api_only(): void
    {
        $canonical = $this->visit('/robots.txt')->assertOk()->getContent();

        $this->assertStringContainsString("Allow: /api/portfolio/\n", $canonical);
        $this->assertStringContainsString("Disallow: /api\n", $canonical);
        $this->assertStringContainsString("Disallow: /api/portfolio/offers/*/pdf\n", $canonical);
    }

    public function test_front_controller_and_trailing_slash_addresses_redirect_to_the_clean_page(): void
    {
        $this->visit('/index.php')->assertStatus(301)->assertRedirect(self::SITE);
        $this->visit('/index.php?id=5')->assertStatus(301)->assertRedirect(self::SITE.'?id=5');
        $this->visit('/index.php/kapcsolat')->assertStatus(301)->assertRedirect(self::SITE.'/kapcsolat');
        // The test client trims a bare trailing slash before sending, so that case is asserted on the request.
        $this->assertSame('/kapcsolat', PublicSiteUrl::cleanRequestUri(Request::create(self::SITE.'/kapcsolat/')));
        $this->visit('/kapcsolat/?utm_source=hirlevel')->assertStatus(301)->assertRedirect(self::SITE.'/kapcsolat?utm_source=hirlevel');
    }

    public function test_clean_addresses_are_served_without_a_redirect(): void
    {
        $this->visit('/')->assertOk();
        $this->visit('/?utm_source=hirlevel')->assertOk();
        $this->visit('/kapcsolat')->assertOk();
        $this->visit('/index.phpx')->assertNotFound();
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
            '/korutazasok/regio/havas-kalandok' => '/kategoriak/havas-kalandok',
            '/korutazasok/regio/repulos-utak' => '/kategoriak/repulos-korutazasok',
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

    public function test_percent_encoded_addresses_find_their_page(): void
    {
        Tour::factory()->create(['seo_name' => 'szlovenia-(3-nap)']);
        Apartment::factory()->create(['slug' => "ca'-rossa-villa-(136)-pučišća"]);

        $this->visit('/ajanlat/szlovenia-%283-nap%29')->assertOk();
        $this->visit('/apartman/ca%27-rossa-villa-%28136%29-pu%C4%8Di%C5%A1%C4%87a')->assertOk();
    }

    public function test_a_trip_that_is_off_leads_to_its_first_category_with_a_page_for_now(): void
    {
        $off = BlogCategory::factory()->create(['active' => false]);
        $advent = BlogCategory::factory()->create(['seo_name' => 'adventi-barangolasok']);
        Tour::factory()->create(['active' => false, 'seo_name' => 'advent-pragaban', 'category_ids' => [(string) $off->id, (string) $advent->id]]);
        Tour::factory()->create(['active' => false, 'seo_name' => 'kategoria-nelkul', 'category_ids' => []]);

        $this->visit('/ajanlat/advent-pragaban')->assertStatus(302)->assertRedirect('/kategoriak/adventi-barangolasok');
        $this->visit('/korutazasok/kategoria-nelkul')->assertStatus(301)->assertRedirect('/ajanlat/kategoria-nelkul');
        $this->visit('/ajanlat/kategoria-nelkul')->assertStatus(302)->assertRedirect('/utazasok');
    }

    public function test_a_deleted_trip_moves_permanently(): void
    {
        Tour::factory()->create(['seo_name' => 'regi-ut', 'category_ids' => []])->delete();

        $this->visit('/ajanlat/regi-ut')->assertStatus(301)->assertRedirect('/utazasok');
    }

    public function test_an_apartment_that_is_off_or_deleted_leads_to_the_apartments_of_its_location(): void
    {
        $bibione = Location::factory()->create(['area_slug' => 'veneto', 'slug' => 'bibione']);
        Apartment::factory()->create(['location_id' => $bibione->id]);
        Apartment::factory()->create(['location_id' => $bibione->id, 'slug' => 'del-sole-(54)-bibione', 'is_active' => false]);
        Apartment::factory()->create(['location_id' => $bibione->id, 'slug' => 'regi-villa-bibione'])->delete();
        Apartment::factory()->create(['slug' => 'maganyos-apartman', 'is_active' => false]);

        $this->visit('/apartman/del-sole-%2854%29-bibione')->assertStatus(302)->assertRedirect('/apartmanok/veneto/bibione');
        $this->visit('/apartman/regi-villa-bibione')->assertStatus(301)->assertRedirect('/apartmanok/veneto/bibione');
        $this->visit('/apartman/maganyos-apartman')->assertStatus(302)->assertRedirect('/');
    }

    public function test_legacy_blog_addresses_lead_to_the_post_or_the_blog(): void
    {
        $live = BlogArticle::factory()->create(['published_at' => now()->subDay()]);
        BlogArticleTranslation::factory()->for($live, 'blogArticle')->create(['seo_name' => 'karnevali-maszkok-velenceben']);
        $off = BlogArticle::factory()->create(['active' => false]);
        BlogArticleTranslation::factory()->for($off, 'blogArticle')->create(['seo_name' => 'kikapcsolt-cikk']);

        $this->visit('/blog/karnevali-maszkok-velenceben-23')->assertStatus(301)->assertRedirect('/blog/karnevali-maszkok-velenceben');
        $this->visit('/blog/teszt-2-25')->assertStatus(301)->assertRedirect('/blog');
        $this->visit('/blog/kikapcsolt-cikk')->assertStatus(302)->assertRedirect('/blog');
        $this->visit('/blog/cimke/utazas-2')->assertStatus(301)->assertRedirect('/blog');
        $this->visit('/blog/kategoria/celpontban-3')->assertStatus(301)->assertRedirect('/blog');
    }

    public function test_the_offices_redirect_list_wins_over_the_listing_of_a_retired_apartment(): void
    {
        Apartment::factory()->create(['slug' => 'musan-i---gradac', 'is_active' => false]);
        SeoRedirect::query()->create(['source_path' => 'apartman/musan-i---gradac', 'target' => '/regiok/croatia']);

        $this->visit('/apartman/musan-i---gradac')->assertStatus(301)->assertRedirect('/regiok/croatia');
    }
}
