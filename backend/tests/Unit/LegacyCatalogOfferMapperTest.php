<?php

namespace Tests\Unit;

use App\Services\Legacy\Catalog\LegacyCatalogOfferMapper;
use App\Support\Tour\TourDateStatus;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class LegacyCatalogOfferMapperTest extends TestCase
{
    /**
     * @return array<string, mixed>
     */
    private function offer(int $legacyId): array
    {
        $catalog = json_decode((string) file_get_contents(__DIR__.'/../Fixtures/legacy-catalog/catalog.json'), true);

        return collect($catalog['offers'])->firstWhere('legacy_id', $legacyId);
    }

    public function test_the_partner_xml_settings_of_the_offer_and_its_dates_are_kept(): void
    {
        $offer = (new LegacyCatalogOfferMapper)->map($this->offer(10), Carbon::parse('2026-10-15'));
        $dates = collect($offer->dates)->keyBy('legacy_id');

        $this->assertSame([
            // The first legacy region the old site knew ("Foci EB 2024" is not one).
            'country_id' => 3,
            'country_name' => 'Svájc',
            'accommodation_name' => 'Svájci körutazás hotelekben',
            'city' => 'Svájc',
            'insurance_value' => 430,
            'accommodation_description_travelmax' => '<p>Középkategóriás hotelek</p>',
            'travel_types' => ['general' => 1, 'travelgate' => 2, 'cesys' => null, 'travelmax' => [1, 16]],
        ], $offer->attributes['partner_xml']);
        $this->assertTrue($dates[12446]['xml_enabled']);
        $this->assertSame(['cesys_accommodation' => 'Hotel***', 'cesys_room' => '2 ágyas szoba'], $dates[12446]['partner_xml']);
        $this->assertFalse($dates[12447]['xml_enabled']);
    }

    public function test_a_date_sells_at_its_sale_price_with_the_original_price_crossed_out(): void
    {
        $offer = (new LegacyCatalogOfferMapper)->map($this->offer(10), Carbon::parse('2026-10-15'));
        $date = collect($offer->dates)->firstWhere('legacy_id', 12446);

        $this->assertEquals(229900, $date['price']);
        $this->assertEquals(229900, $date['price_box_price']);
        $this->assertEquals(238400, $date['price_box_original_price']);
        $this->assertSame(45, $date['price_box_available_seats']);
        $this->assertSame(TourDateStatus::AVAILABLE, $date['status']);
        // The tour's price comes from its upcoming bookable dates.
        $this->assertEquals(229900, $offer->attributes['price']);
        $this->assertSame('229.900 Ft', $offer->attributes['displayed_price']);
    }

    public function test_a_watched_date_without_seats_is_sold_out_and_an_inactive_one_cancelled(): void
    {
        $mapper = new LegacyCatalogOfferMapper;

        $full = collect($mapper->map($this->offer(10), Carbon::parse('2026-10-15'))->dates)->firstWhere('legacy_id', 9001);
        $inactive = collect($mapper->map($this->offer(30), Carbon::parse('2026-10-15'))->dates)->firstWhere('legacy_id', 14001);

        $this->assertSame(TourDateStatus::SOLD_OUT, $full['status']);
        $this->assertSame(0, $full['price_box_available_seats']);
        $this->assertSame(TourDateStatus::CANCELLED, $inactive['status']);
        $this->assertFalse($inactive['legacy_attributes']['active']);
    }

    public function test_the_tour_takes_the_most_common_stay_and_a_date_keeps_only_a_different_one(): void
    {
        $offer = (new LegacyCatalogOfferMapper)->map($this->offer(10), Carbon::parse('2026-10-15'));
        $dates = collect($offer->dates)->keyBy('legacy_id');

        $this->assertSame('Hotel***', $offer->attributes['accommodation']);
        $this->assertSame('2 ágyas', $offer->attributes['accommodation_info']);
        $this->assertNull($dates[12446]['accommodation']);
        $this->assertSame('Hotel****', $dates[12447]['accommodation']);
        $this->assertSame('Medencés', $dates[12447]['accommodation_info']);
        $this->assertSame('bus', $offer->travelMode);
    }

    public function test_resort_fees_become_mandatory_extras_in_their_own_currency_unless_already_listed(): void
    {
        $offer = $this->offer(10);
        $date = collect((new LegacyCatalogOfferMapper)->map($offer, Carbon::parse('2026-10-15'))->dates)->firstWhere('legacy_id', 12446);

        $this->assertSame(
            [['Üdülőhelyi illeték', 6800.0, 'HUF'], ['Üdülőhelyi illeték', 8.0, 'EUR']],
            collect($date['extras'])->whereNull('legacy_id')->map(fn (array $extra): array => [$extra['name'], $extra['price'], $extra['currency']])->values()->all(),
        );

        $offer['departures'][0]['extra_prices'][] = ['legacy_id' => 9, 'name' => 'üdülőhelyi illeték', 'price' => 6800, 'unit' => 'Ft/fő', 'type' => 'Előre kiválasztott, kötelező', 'raw' => ''];
        $mapped = (new LegacyCatalogOfferMapper)->map($offer, Carbon::parse('2026-10-15'));
        $date = collect($mapped->dates)->firstWhere('legacy_id', 12446);

        $this->assertSame(['EUR'], collect($date['extras'])->whereNull('legacy_id')->pluck('currency')->all());
        $this->assertContains('Date 12446: the resort fee is listed as an extra too; it is charged once.', $mapped->notes);
    }

    public function test_every_file_the_offer_shows_is_listed_for_the_media_mirror(): void
    {
        $offer = (new LegacyCatalogOfferMapper)->map($this->offer(10), Carbon::parse('2026-10-15'));

        $this->assertEqualsCanonicalizing([
            'https://adriaholiday.hu/uploads/gallery/77/501.jpg',
            'https://adriaholiday.hu/uploads/gallery/77/502.jpg',
            'https://adriaholiday.hu/uploads/gallery/77/503.jpg',
            'https://adriaholiday.hu/uploads/gallery/6303/601.jpg',
            'https://adriaholiday.hu/files/111000122345.jpg',
            'https://adriaholiday.hu/files/svajc.pdf',
            'https://adriaholiday.hu/files/svajc/terkep.jpg',
        ], $offer->mediaUrls('https://adriaholiday.hu'));
    }

    public function test_the_legacy_admins_example_seo_texts_are_left_out(): void
    {
        $offer = $this->offer(10);
        $offer['extra_fields']['seo[title]'] = 'út címe';
        $offer['extra_fields']['seo[description]'] = '120-160 karakeres mondat ami az út fő jellemzőit tartalmazza';

        $mapped = (new LegacyCatalogOfferMapper)->map($offer, Carbon::parse('2026-10-15'));

        $this->assertNull($mapped->attributes['seo_title']);
        $this->assertNull($mapped->attributes['seo_description']);
        $this->assertSame('út címe', $mapped->legacyAttributes['extra_fields']['seo[title]']);
        $this->assertCount(2, array_filter($mapped->notes, fn (string $note): bool => str_contains($note, "admin's example text")));
    }

    public function test_an_active_offer_missing_from_the_legacy_admin_list_is_imported_inactive(): void
    {
        $offer = [...$this->offer(10), 'listed_in_admin_offer_list' => false];

        $mapped = (new LegacyCatalogOfferMapper)->map($offer, Carbon::parse('2026-10-15'));

        $this->assertFalse($mapped->active);
        $this->assertFalse($mapped->attributes['active']);
        $this->assertTrue($mapped->legacyAttributes['legacy_active']);
        $this->assertContains("Active in the legacy data but missing from the legacy admin's offer list: imported inactive.", $mapped->notes);
    }
}
