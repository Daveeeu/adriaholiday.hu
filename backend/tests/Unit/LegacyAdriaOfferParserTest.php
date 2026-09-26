<?php

namespace Tests\Unit;

use App\Services\Legacy\LegacyAdriaOfferParser;
use PHPUnit\Framework\TestCase;

class LegacyAdriaOfferParserTest extends TestCase
{
    private const SOURCE_URL = 'https://adriaholiday.hu/korutazasok/albania-makedoniaval-fuszerezve';

    private function html(): string
    {
        return file_get_contents(__DIR__.'/../Fixtures/legacy-adria-offer.html');
    }

    public function test_it_extracts_name_and_seo_name(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), self::SOURCE_URL);

        $this->assertSame('Albánia, a Balkán Riviérája', $data->name);
        $this->assertSame('albania-makedoniaval-fuszerezve', $data->seoName);
        $this->assertSame('Belgrád-Shkoder-Berat-Tirana-Kruja-Durres-Skopje-Ohrid-Vlora', $data->shortDescription);
    }

    public function test_it_extracts_original_quality_gallery_image_urls(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), self::SOURCE_URL);

        $this->assertCount(10, $data->galleryImageUrls);
        $this->assertSame(
            'https://adriaholiday.hu/uploads/gallery/16205_74121285244_5052/601278807aa297.72820162.jpg',
            $data->galleryImageUrls[0],
        );

        foreach ($data->galleryImageUrls as $url) {
            $this->assertStringNotContainsString('framework/img.php', $url);
        }
    }

    public function test_it_extracts_dates_with_transport_catering_accommodation_and_price(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), self::SOURCE_URL);

        $this->assertCount(1, $data->dates);
        $date = $data->dates[0];

        $this->assertSame('2026-09-25', $date['start_date']);
        $this->assertSame('2026-10-01', $date['end_date']);
        $this->assertSame(269600.0, $date['price']);
        $this->assertSame('bus', $date['transport_code']);
        $this->assertSame('félpanzió', $date['catering']);
        $this->assertSame('Hotel***', $date['accommodation']);

        $this->assertSame('bus', $data->travelModeCode);
        $this->assertSame('félpanzió', $data->catering);
        $this->assertSame('Hotel***', $data->accommodation);
        $this->assertSame(269600.0, $data->price);
    }

    public function test_it_extracts_program_days_from_unstructured_paragraphs(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), self::SOURCE_URL);

        $this->assertCount(7, $data->programDays);

        $day1 = $data->programDays[0];
        $this->assertSame(1, $day1['day_number']);
        $this->assertStringContainsString('BELGRÁD', $day1['title']);
        $this->assertStringContainsString('Indulás a kora reggeli', $day1['description']);

        $day7 = $data->programDays[6];
        $this->assertSame(7, $day7['day_number']);
        $this->assertStringContainsString('Hazatérés', $day7['title']);
    }

    public function test_it_splits_price_items_into_included_and_excluded(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), self::SOURCE_URL);

        $included = array_values(array_filter($data->priceItems, fn (array $item): bool => $item['type'] === 'included'));
        $excluded = array_values(array_filter($data->priceItems, fn (array $item): bool => $item['type'] === 'excluded'));

        $this->assertCount(4, $included);
        $this->assertSame('autóbuszközlekedés', $included[0]['text']);

        $this->assertNotEmpty($excluded);
        $this->assertTrue(collect($excluded)->contains(fn (array $item): bool => str_contains($item['text'], 'üdülőhelyi illeték')));
    }

    public function test_it_extracts_departure_places_and_tags(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), self::SOURCE_URL);

        $this->assertSame(
            ['Miskolc', 'Mezőkövesd', 'Gyöngyös', 'Hatvan', 'Budapest', 'Kecskemét', 'Kiskunfélegyháza', 'Szeged'],
            $data->departurePlaceNames,
        );

        $this->assertContains('Albánia', $data->tags);
        $this->assertGreaterThanOrEqual(10, count($data->tags));
    }

    public function test_it_prefers_crawl_context_categories_over_breadcrumb(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), self::SOURCE_URL, [
            'countries' => ['albania'],
            'categories' => ['korutazas', 'tengerparti-udulesek'],
        ]);

        $this->assertSame(['albania'], $data->countrySlugs);
        $this->assertSame(['Körutazás', 'Tengerparti üdülések'], $data->categories);
    }

    public function test_it_falls_back_to_breadcrumb_category_without_crawl_context(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), self::SOURCE_URL);

        $this->assertSame(['Tengerparti üdülések'], $data->categories);
    }

    public function test_it_collects_leftover_paragraphs_as_notes(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), self::SOURCE_URL);

        $this->assertNotNull($data->notesHtml);
        $this->assertStringContainsString('fakultatív programok', $data->notesHtml);
        $this->assertStringContainsString('Útiokmány', $data->notesHtml);
        $this->assertNull($data->discountsHtml);
    }

    public function test_it_reads_legacy_date_ids_and_attaches_booking_options_to_dates(): void
    {
        $parser = new LegacyAdriaOfferParser;

        $this->assertSame([12250], $parser->legacyDateIds($this->html()));

        $data = $parser->parse($this->html(), self::SOURCE_URL, [], [
            12250 => [
                'felszallas_items' => '<option value="">Kérem válasszon!</option><option value=96>269.600 Ft/fő budapesti indulással</option>',
                'extra_prices_items' => '<div class="row"><div class="col-sm-4"><div class="no-margin"><input class="price_changer extra_price_changer" data-id="1" type="checkbox"> Vacsora</div></div><div class="col-sm-4"><p class="no-margin">12.000 Ft/fő</p></div></div>',
            ],
        ]);

        $this->assertSame(12250, $data->dates[0]['legacy_id']);
        $this->assertSame([
            ['name' => 'Vacsora', 'price' => 12000.0, 'price_unit' => 'per_person', 'mandatory' => false],
        ], $data->dates[0]['extras']);
        $this->assertSame(['budapesti indulással'], $data->departurePlaceNames);
    }

    public function test_it_parses_short_date_ranges_current_discounted_prices_and_labels_without_popover_text(): void
    {
        $html = <<<'HTML'
            <html><body><h1>Napfényes Itália</h1>
            <table class="table hotels-details-inner-dates">
                <tr><th>Időpont</th></tr>
                <tr>
                    <td>2027.05.01. - 04.</td>
                    <td><i class="fa fa-bus"></i></td>
                    <td><div class="popover-info"><span>önellátás</span></div><div class="d-none popover-data"><div class="popover-content"><p>éttermek a közelben</p></div></div></td>
                    <td><div class="popover-info"><span>apartman</span></div><div class="d-none popover-data"><div class="popover-content"><p>5-6 fős apartmanok</p></div></div></td>
                    <td><span style="text-decoration: line-through">84.900,-Ft/fő-től</span><br><span style="color:red">74.900,-Ft/fő-től</span></td>
                    <td><span class="thm-btn thm-btn-reserve" data-date-id="12319">Foglalás</span></td>
                </tr>
                <tr>
                    <td>2026.12.30. - 01.02.</td>
                    <td><i class="fa fa-bus"></i></td>
                    <td>reggeli</td>
                    <td>Hotel***</td>
                    <td><span>99.900,-Ft/fő-től</span></td>
                    <td><span class="thm-btn thm-btn-reserve" data-date-id="12320">Foglalás</span></td>
                </tr>
            </table></body></html>
            HTML;

        $data = (new LegacyAdriaOfferParser)->parse($html, 'https://adriaholiday.hu/korutazasok/napfenyes-italia-2018');

        $this->assertSame('2027-05-01', $data->dates[0]['start_date']);
        $this->assertSame('2027-05-04', $data->dates[0]['end_date']);
        $this->assertSame(74900.0, $data->dates[0]['price']);
        $this->assertSame('önellátás', $data->dates[0]['catering']);
        $this->assertSame('apartman', $data->dates[0]['accommodation']);

        $this->assertSame('2026-12-30', $data->dates[1]['start_date']);
        $this->assertSame('2027-01-02', $data->dates[1]['end_date']);
        $this->assertSame(99900.0, $data->dates[1]['price']);

        $this->assertSame(74900.0, $data->price);
    }

    public function test_it_keeps_multibyte_characters_of_the_legacy_slug(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), 'https://adriaholiday.hu/korutazasok/umbria-–-italia-zold-szive-2019');

        $this->assertSame('umbria-–-italia-zold-szive-2019', $data->seoName);
    }
}
