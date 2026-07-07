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
}
