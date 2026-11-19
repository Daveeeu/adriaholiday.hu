<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\BlogCategory;
use App\Models\Location;
use App\Models\PortfolioContentBlock;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDate;
use App\Support\Tour\TourDateStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PortfolioCrawlableContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['seo.site_url' => 'https://adriaholiday.hu']);
    }

    private function visit(string $path): TestResponse
    {
        return $this->get("https://adriaholiday.hu{$path}");
    }

    public function test_a_page_carries_its_text_the_menu_and_the_offices_contact_hidden_from_scripted_browsers(): void
    {
        $html = $this->visit('/rolunk')->assertOk()->getContent();

        $this->assertStringContainsString('<div id="root"><div data-seo-content><h1>Rólunk</h1><p>Az Adria Holiday 2003 óta', $html);
        $this->assertStringContainsString('<a href="/utazasok">Utazások</a>', $html);
        $this->assertStringContainsString('<li>3530 Miskolc, Városház tér 22. – iroda</li>', $html);
        $this->assertStringContainsString('<a href="tel:+3646508688">+36 46 508 688</a>', $html);
        $this->assertStringContainsString('<a href="mailto:adriaholiday@adriaholiday.hu">', $html);
        $this->assertStringContainsString('Hétfő–Péntek: 08:00–17:00 – nyitvatartás', $html);
        $this->assertStringContainsString('<style>.js [data-seo-content]{display:none}</style>', $html);
        $this->assertSame(1, substr_count($html, 'data-seo-content>'));
    }

    public function test_a_category_lists_its_trips_with_route_date_and_price(): void
    {
        $advent = BlogCategory::factory()->create(['seo_name' => 'adventi-barangolasok']);
        $brno = Tour::factory()->create([
            'name' => 'Brno adventi fényei',
            'seo_name' => 'brno-adventi-fenyei',
            'short_description' => 'Brno - Mikulov - Schloss Hof',
            'price' => 68600,
            'category_ids' => [(string) $advent->id],
        ]);
        TourDate::factory()->for($brno)->create(['start_date' => '2027-11-28', 'end_date' => '2027-11-29']);
        Tour::factory()->create(['name' => 'Más kategória', 'seo_name' => 'mas-kategoria', 'category_ids' => []]);
        Tour::factory()->create(['name' => 'Rejtett út', 'seo_name' => 'rejtett-ut', 'listed' => false, 'category_ids' => [(string) $advent->id]]);

        $html = $this->visit('/kategoriak/adventi-barangolasok')->assertOk()->getContent();

        $this->assertStringContainsString('<a href="/ajanlat/brno-adventi-fenyei">Brno adventi fényei</a> – Brno - Mikulov - Schloss Hof · 2027.11.28. – 2027.11.29. · induló ár 68 600 Ft', $html);
        $this->assertStringNotContainsString('mas-kategoria', $html);
        $this->assertStringNotContainsString('rejtett-ut', $html);
    }

    public function test_an_offer_page_tells_the_trip_with_its_program_price_dates_and_categories(): void
    {
        $category = BlogCategory::factory()->create(['seo_name' => 'korutazasok']);
        $tour = Tour::factory()->create([
            'name' => 'Andalúzia csodái',
            'seo_name' => 'andaluzia-csodai',
            'short_description' => 'Sevilla - Cordoba - Granada',
            'program' => '<p><strong>1. nap:</strong> Budapest – Malaga</p><p>2. nap: Granada, Alhambra</p>',
            'price' => 329900,
            'category_ids' => [(string) $category->id],
        ]);
        TourDate::factory()->for($tour)->create(['start_date' => '2027-04-13', 'end_date' => '2027-04-18', 'price' => 329900]);

        $html = $this->visit('/ajanlat/andaluzia-csodai')->assertOk()->getContent();

        $this->assertStringContainsString('<h1>Andalúzia csodái</h1><p>Sevilla - Cordoba - Granada</p>', $html);
        $this->assertStringContainsString('<p>Induló ár: 329 900 Ft/fő</p><p>1. nap: Budapest – Malaga</p><p>2. nap: Granada, Alhambra</p>', $html);
        $this->assertStringContainsString('<li>2027.04.13. – 2027.04.18. – 329 900 Ft/fő</li>', $html);
        $this->assertStringContainsString('<a href="/kategoriak/korutazasok">', $html);
    }

    public function test_a_region_lists_its_own_trips(): void
    {
        $montenegro = Region::factory()->create(['slug' => 'montenegro', 'name' => 'Montenegró', 'description' => '<p>Smaragdzöld öblök.</p>']);
        Tour::factory()->create(['name' => 'Montenegrói nyaralás', 'seo_name' => 'montenegroi-nyaralas', 'region_id' => $montenegro->id]);
        Tour::factory()->create(['name' => 'Toszkána', 'seo_name' => 'toszkana', 'region_id' => Region::factory()]);

        $html = $this->visit('/regiok/montenegro')->assertOk()->getContent();

        $this->assertStringContainsString('<h1>Montenegró</h1><p>Smaragdzöld öblök.</p>', $html);
        $this->assertStringContainsString('<a href="/ajanlat/montenegroi-nyaralas">Montenegrói nyaralás</a>', $html);
        $this->assertStringNotContainsString('/ajanlat/toszkana', $html);
    }

    public function test_an_apartment_location_lists_its_public_apartments(): void
    {
        $bibione = Location::factory()->create(['area_slug' => 'veneto', 'slug' => 'bibione', 'name' => 'Bibione']);
        Apartment::factory()->create(['location_id' => $bibione->id, 'name' => 'Urano Apartman (57) Bibione', 'slug' => 'urano-apartman-(57)-bibione']);
        Apartment::factory()->create(['location_id' => $bibione->id, 'name' => 'Kikapcsolt', 'slug' => 'kikapcsolt', 'is_active' => false]);

        $html = $this->visit('/apartmanok/veneto/bibione')->assertOk()->getContent();

        $this->assertStringContainsString('<a href="/apartman/urano-apartman-(57)-bibione">Urano Apartman (57) Bibione</a>', $html);
        $this->assertStringNotContainsString('/apartman/kikapcsolt', $html);
    }

    public function test_the_home_page_names_the_office_address_location_and_hours_for_maps_and_assistants(): void
    {
        $html = $this->visit('/')->assertOk()->getContent();

        $this->assertStringContainsString('"address":{"@type":"PostalAddress","streetAddress":"Városház tér 22.","postalCode":"3530","addressLocality":"Miskolc","addressCountry":"HU"}', $html);
        $this->assertStringContainsString('"geo":{"@type":"GeoCoordinates","latitude":48.10275,"longitude":20.77946}', $html);
        $this->assertStringContainsString('"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"08:00","closes":"17:00"}]', $html);
        $this->assertStringContainsString('"areaServed":{"@type":"Country","name":"Magyarország"}', $html);
    }

    public function test_the_home_page_answers_its_published_questions_as_text_and_faq_structured_data(): void
    {
        PortfolioContentBlock::factory()->create([
            'key' => 'home.faq.items',
            'type' => 'json',
            'value' => null,
            'value_json' => [
                ['question' => 'Mikor kell fizetnem?', 'answer' => '<p>Foglaláskor előleget fizetsz.</p>'],
                ['question' => 'Mióta utaztattok?', 'answer' => '{evek} éve.'],
                ['question' => 'Válasz nélkül', 'answer' => ''],
            ],
            'draft_value_json' => [['question' => 'Piszkozat', 'answer' => 'Még nem publikus.']],
        ]);

        $html = $this->visit('/')->assertOk()->getContent();

        $this->assertStringContainsString('<section><h2>Gyakran ismételt kérdések</h2><h3>Mikor kell fizetnem?</h3><p>Foglaláskor előleget fizetsz.</p><h3>Mióta utaztattok?</h3><p>', $html);
        $this->assertStringContainsString('"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Mikor kell fizetnem?","acceptedAnswer":{"@type":"Answer","text":"Foglaláskor előleget fizetsz."}}', $html);
        $this->assertStringNotContainsString('{evek}', $html);
        $this->assertStringNotContainsString('Válasz nélkül', $html);
        $this->assertStringNotContainsString('Piszkozat', $html);
    }

    public function test_an_offer_has_an_offer_per_upcoming_date_until_departure(): void
    {
        $tour = Tour::factory()->create(['seo_name' => 'katalan-karneval', 'price' => 289800]);
        TourDate::factory()->for($tour)->create(['start_date' => '2027-02-04', 'end_date' => '2027-02-08', 'price' => 299800]);
        TourDate::factory()->for($tour)->create(['start_date' => '2027-03-04', 'end_date' => '2027-03-08', 'price' => null, 'status' => TourDateStatus::SOLD_OUT]);
        TourDate::factory()->for($tour)->create(['start_date' => '2027-04-04', 'end_date' => '2027-04-08', 'status' => TourDateStatus::CANCELLED]);
        TourDate::factory()->for($tour)->create(['start_date' => now()->subMonth(), 'end_date' => now()->subMonth()->addDays(4)]);

        $html = $this->visit('/ajanlat/katalan-karneval')->assertOk()->getContent();

        $this->assertStringContainsString('"offers":[{"@type":"Offer","price":299800,"priceCurrency":"HUF","availability":"https://schema.org/InStock","validThrough":"2027-02-04"', $html);
        $this->assertStringContainsString('{"@type":"Offer","price":289800,"priceCurrency":"HUF","availability":"https://schema.org/SoldOut","validThrough":"2027-03-04"', $html);
        $this->assertStringNotContainsString('2027-04-04', $html);
        $this->assertStringNotContainsString('2027.04.04.', $html);
    }

    public function test_llms_txt_summarizes_the_office_for_ai_assistants_on_the_canonical_host_only(): void
    {
        $advent = BlogCategory::factory()->create(['seo_name' => 'adventi-barangolasok']);
        Tour::factory()->create(['name' => 'Brno adventi fényei', 'seo_name' => 'brno-adventi-fenyei', 'featured' => true, 'short_description' => 'Brno - Mikulov', 'price' => 68600, 'category_ids' => [(string) $advent->id]]);

        $response = $this->visit('/llms.txt')->assertOk()->assertHeader('Content-Type', 'text/markdown; charset=UTF-8');
        $text = $response->getContent();

        $this->assertStringStartsWith("# Adria Holiday\n", $text);
        $this->assertStringContainsString('- [Brno adventi fényei](https://adriaholiday.hu/ajanlat/brno-adventi-fenyei): Brno - Mikulov · induló ár 68 600 Ft', $text);
        $this->assertStringContainsString('- [Utazások](https://adriaholiday.hu/utazasok)', $text);
        $this->assertStringContainsString('- 3530 Miskolc, Városház tér 22.: iroda', $text);
        $this->assertStringContainsString('- [+36 46 508 688](tel:+3646508688)', $text);

        $this->get('https://adriaholiday.jandldavid.hu/llms.txt')->assertNotFound();
    }

    public function test_a_missing_page_carries_no_content(): void
    {
        $html = $this->visit('/nincs-ilyen-oldal')->assertNotFound()->getContent();

        $this->assertStringNotContainsString('data-seo-content', $html);
        $this->assertStringContainsString('<div id="root"></div>', $html);
    }

    public function test_text_from_the_admin_is_escaped(): void
    {
        Tour::factory()->create(['name' => 'Út <script>alert(1)</script>', 'seo_name' => 'veszelyes-ut', 'short_description' => null, 'program' => null]);

        $html = $this->visit('/ajanlat/veszelyes-ut')->assertOk()->getContent();

        $this->assertStringContainsString('<h1>Út &lt;script&gt;alert(1)&lt;/script&gt;</h1>', $html);
        $this->assertStringNotContainsString('<script>alert(1)</script>', $html);
    }
}
