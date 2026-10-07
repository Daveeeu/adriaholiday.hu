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

    public function test_it_separates_the_bold_title_of_a_single_line_program_day_from_its_description(): void
    {
        $longHeading = str_repeat('Hosszú napleírás egyetlen sorban. ', 10);
        $html = '<html><body><div class="program-content">'
            .'<p><strong>1.nap</strong> Indulás a hajnali órákban, útközben Portogruaro.</p>'
            .'<p><strong>2. NAP SAN MARINO</strong> Reggeli után kirándulás a törpeállamba.</p>'
            .'<p>3. nap Hazautazás Bolognán keresztül.</p>'
            .'<p>4. NAP '.$longHeading.'<br>Este érkezés.</p>'
            .'</div></body></html>';

        $days = (new LegacyAdriaOfferParser)->parse($html, self::SOURCE_URL)->programDays;

        $this->assertSame([
            ['day_number' => 1, 'title' => '1. nap', 'description' => 'Indulás a hajnali órákban, útközben Portogruaro.'],
            ['day_number' => 2, 'title' => 'SAN MARINO', 'description' => 'Reggeli után kirándulás a törpeállamba.'],
            ['day_number' => 3, 'title' => '3. nap', 'description' => 'Hazautazás Bolognán keresztül.'],
            ['day_number' => 4, 'title' => '4. nap', 'description' => trim($longHeading).' Este érkezés.'],
        ], $days);
    }

    public function test_paragraphs_after_a_day_heading_continue_that_day(): void
    {
        $html = '<html><body><div class="program-content">'
            .'<p><strong>1. NAP VOLCJI POTOK - LJUBLJANA -&nbsp;</strong>Virágok és alpesi panorámák</p>'
            .'<p>Kora reggel útnak indulunk az arborétumba.</p>'
            .'<p><strong>2. NAP BLEDI-TÓ</strong></p>'
            .'<p>Reggel a Vintgar-szurdokot keressük fel.</p>'
            .'<p>A program tartalmaz időjárásfüggő látványosságokat.</p>'
            .'<p>Részvételi díj: 75.600 Ft/fő</p>'
            .'<p>A belépőjegy árak tájékoztató jellegűek.</p>'
            .'</div></body></html>';

        $data = (new LegacyAdriaOfferParser)->parse($html, self::SOURCE_URL);

        $this->assertSame([
            [
                'day_number' => 1,
                'title' => 'VOLCJI POTOK - LJUBLJANA',
                'description' => "<p>Virágok és alpesi panorámák</p>\n<p>Kora reggel útnak indulunk az arborétumba.</p>",
            ],
            ['day_number' => 2, 'title' => 'BLEDI-TÓ', 'description' => '<p>Reggel a Vintgar-szurdokot keressük fel.</p>'],
        ], $data->programDays);
        $this->assertSame(
            "<p>A program tartalmaz időjárásfüggő látványosságokat.</p>\n<p>A belépőjegy árak tájékoztató jellegűek.</p>",
            $data->notesHtml,
        );
    }

    public function test_a_paragraph_after_the_last_day_is_a_note_unless_every_day_continues(): void
    {
        $html = '<html><body><div class="program-content">'
            .'<p>1. NAP<br>Indulás Budapestről.</p>'
            .'<p>a.) Fakultatív kirándulás Windsorba.</p>'
            .'<p>2. NAP<br>Városnézés.</p>'
            .'<p>3. NAP<br>Hazautazás.</p>'
            .'<p>A programváltoztatás jogát fenntartjuk.</p>'
            .'</div></body></html>';

        $data = (new LegacyAdriaOfferParser)->parse($html, self::SOURCE_URL);

        $this->assertSame("<p>Indulás Budapestről.</p>\n<p>a.) Fakultatív kirándulás Windsorba.</p>", $data->programDays[0]['description']);
        $this->assertSame('Városnézés.', $data->programDays[1]['description']);
        $this->assertSame('Hazautazás.', $data->programDays[2]['description']);
        $this->assertSame('<p>A programváltoztatás jogát fenntartjuk.</p>', $data->notesHtml);
    }

    public function test_price_sections_are_read_line_by_line_across_paragraphs(): void
    {
        $html = '<html><body><div class="program-content">'
            .'<p>1. NAP<br>Indulás.</p>'
            .'<p>Részvételi díj: 94.600 Ft/fő helyett 89.900 Ft/fő<br>Előfoglalási kedvezmény 2026.10.31-ig<br>Az ár tartalmazza:<br style="box-sizing: border-box;" />- autóbuszközlekedés<br>- 2 reggeli</p>'
            .'<p>Milyen költségek merülhetnek fel?</p>'
            .'<p>- belépők<br>- kedvezményes vacsora: 8.000 Ft/fő</p>'
            .'<p>Felszállási lehetőség: Miskolc</p>'
            .'</div></body></html>';

        $data = (new LegacyAdriaOfferParser)->parse($html, self::SOURCE_URL);

        $this->assertSame([
            ['type' => 'included', 'text' => 'autóbuszközlekedés'],
            ['type' => 'included', 'text' => '2 reggeli'],
            ['type' => 'excluded', 'text' => 'belépők'],
            ['type' => 'excluded', 'text' => 'kedvezményes vacsora: 8.000 Ft/fő'],
        ], $data->priceItems);
        $this->assertSame('<p>Előfoglalási kedvezmény 2026.10.31-ig</p>', $data->discountsHtml);
        $this->assertSame('<p>Felszállási lehetőség: Miskolc</p>', $data->notesHtml);
        $this->assertSame(94600.0, $data->price);
    }

    public function test_a_price_sentence_lists_what_the_price_includes_and_excludes(): void
    {
        $html = '<html><body><div class="program-content">'
            .'<p>Részvételi díj: 179.800 Ft/fő, mely tartalmazza az utazást autóbusszal és az idegenvezetés díját. Nem tartalmazza a belépőjegyek díját.</p>'
            .'</div></body></html>';

        $data = (new LegacyAdriaOfferParser)->parse($html, self::SOURCE_URL);

        $this->assertSame([
            ['type' => 'included', 'text' => 'Az utazást autóbusszal és az idegenvezetés díját'],
            ['type' => 'excluded', 'text' => 'A belépőjegyek díját'],
        ], $data->priceItems);
    }

    public function test_it_takes_countries_and_categories_from_crawl_context(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), self::SOURCE_URL, [
            'countries' => ['albania'],
            'categories' => ['korutazas', 'tengerparti-udulesek', 'advent'],
        ]);

        $this->assertSame(['albania'], $data->countrySlugs);
        $this->assertSame(['Körutazások', 'Tengerpartok', 'Adventi barangolások'], $data->categories);
    }

    public function test_it_takes_no_categories_or_countries_from_the_breadcrumb_without_crawl_context(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), self::SOURCE_URL);

        $this->assertSame([], $data->categories);
        $this->assertSame([], $data->countrySlugs);
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
                'options' => [
                    'felszallas_items' => '<option value="">Kérem válasszon!</option><option value=96>269.600 Ft/fő budapesti indulással</option><option value=97>274.300 Ft/fő Budapest BOK csarnok</option>',
                    'extra_prices_items' => '<div class="row"><div class="col-sm-4"><div class="no-margin"><input class="price_changer extra_price_changer" data-id="1" type="checkbox"> Vacsora</div></div><div class="col-sm-4"><p class="no-margin">12.000 Ft/fő</p></div></div>',
                ],
                'quote' => ['resort_fee_value_person' => 0, 'resort_fee_eur_value_person' => '8', 'last_minute_value_text' => 5],
            ],
        ]);

        $this->assertSame(12250, $data->dates[0]['legacy_id']);
        $this->assertSame([
            ['name' => 'Vacsora', 'price' => 12000.0, 'price_unit' => 'per_person', 'charge_rule' => 'optional', 'choices' => []],
        ], $data->dates[0]['extras']);
        $this->assertSame('-5%', $data->dates[0]['discount_badge']);
        $this->assertSame(['budapesti indulással', 'Budapest BOK csarnok'], $data->departurePlaceNames);
        $this->assertSame(['Budapest BOK csarnok' => 4700.0], $data->departurePlaceFees);
        $this->assertContains(['type' => 'excluded', 'text' => 'Üdülőhelyi illeték: 8 EUR/fő, helyszínen fizetendő'], $data->priceItems);
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

    public function test_it_reads_the_struck_price_and_the_note_under_a_date_price(): void
    {
        $cell = fn (string $prices, string $note): string => '<td><div role="button"><div style="display: inline-block">'
            .$prices.($note !== '' ? '<div style="color:#ff0000;">'.$note.'</div>' : '')
            .'</div></div><div class="d-none popover-data"><div class="popover-title">Információ</div></div></td>';
        $row = fn (string $date, string $priceCell, int $id): string => "<tr><td>{$date}</td><td><i class=\"fa fa-bus\"></i></td><td>reggeli</td><td>Hotel***</td>{$priceCell}"
            ."<td><span data-date-id=\"{$id}\">Foglalás</span></td></tr>";
        $html = '<html><body><h1>Bosznia</h1><table class="table hotels-details-inner-dates"><tr><th>Időpont</th></tr>'
            .$row('2027.05.06. - 09.', $cell('<span style="text-decoration: line-through">136.600,-Ft/fő-től</span><br><span>129.600,-Ft/fő-től</span>', 'Előfoglalási akció'), 1)
            .$row('2026.10.23. - 25.', $cell('<span>159.800,-Ft/fő-től</span>', 'Őszi szünet'), 2)
            .$row('2026.10.22. - 25.', $cell('<span>118.600,-Ft/fő-től</span>', 'Betelt!'), 3)
            .$row('2027.06.10. - 13.', $cell('<span>129.600,-Ft/fő-től</span>', ''), 4)
            .'</table></body></html>';

        $dates = (new LegacyAdriaOfferParser)->parse($html, self::SOURCE_URL)->dates;

        $this->assertSame([129600.0, 136600.0, 'Előfoglalási akció', false], [$dates[0]['price'], $dates[0]['original_price'], $dates[0]['label'], $dates[0]['sold_out']]);
        $this->assertSame([null, 'Őszi szünet', false], [$dates[1]['original_price'], $dates[1]['label'], $dates[1]['sold_out']]);
        $this->assertSame([null, true], [$dates[2]['label'], $dates[2]['sold_out']]);
        $this->assertSame([null, null, false], [$dates[3]['original_price'], $dates[3]['label'], $dates[3]['sold_out']]);
    }

    public function test_it_keeps_multibyte_characters_of_the_legacy_slug(): void
    {
        $data = (new LegacyAdriaOfferParser)->parse($this->html(), 'https://adriaholiday.hu/korutazasok/umbria-–-italia-zold-szive-2019');

        $this->assertSame('umbria-–-italia-zold-szive-2019', $data->seoName);
    }
}
