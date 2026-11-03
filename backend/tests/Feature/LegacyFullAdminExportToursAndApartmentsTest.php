<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Booking;
use App\Models\LegacyImportRecord;
use App\Models\Location;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegacyFullAdminExportToursAndApartmentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Legacy apartments land in the site region of their country.
        Region::factory()->create(['slug' => 'italy', 'name' => 'Olaszország', 'country_code' => 'IT']);
    }

    public function test_offers_become_tours_with_their_dates_extras_and_departure_places(): void
    {
        $this->import($this->export());

        $tour = Tour::query()->where('legacy_id', 10)->sole();
        $this->assertSame('svajc-a-hofodte-alpoktol', $tour->seo_name);
        $this->assertTrue($tour->active);

        $date = TourDate::query()->where('legacy_id', 12446)->sole();
        $this->assertSame($tour->id, $date->tour_id);
        $this->assertSame('2027-07-16', $date->start_date->toDateString());
        $this->assertEquals(238400, $date->price_box_price);
        $this->assertSame(['Egyágyas felár'], $date->extras()->pluck('name')->all());
        $this->assertSame(['Budapest BOK Csarnok'], $tour->departurePlaces()->pluck('name')->all());
    }

    public function test_what_the_admin_form_lacks_is_kept_from_the_catalog_imported_before(): void
    {
        LegacyImportRecord::query()->create([
            'entity' => LegacyImportRecord::OFFER,
            'legacy_id' => 10,
            'payload_sha256' => str_repeat('0', 64),
            'raw_payload' => LegacyImportRecord::encodePayload(['coupon_enabled' => true, 'program_footer_html' => '<p>A program változhat.</p>']),
            'status' => LegacyImportRecord::IMPORTED,
        ]);

        $this->import($this->export());

        $tour = Tour::query()->where('legacy_id', 10)->sole();
        $this->assertTrue($tour->couponable);
        $this->assertStringContainsString('A program változhat.', (string) $tour->program_footer);
    }

    public function test_a_booked_date_keeps_its_bookings_on_a_re_run(): void
    {
        $this->import($this->export());
        $date = TourDate::query()->where('legacy_id', 12446)->sole();
        $booking = Booking::factory()->create(['tour_id' => $date->tour_id, 'tour_date_id' => $date->id]);

        $export = $this->export();
        $export['relations']['roundtrip_offer_dates']['10'][0]['fields']['price'] = '249900';
        $this->import($export);

        $this->assertSame($date->id, $booking->fresh()->tour_date_id);
        $this->assertEquals(249900, $date->fresh()->price_box_price);
    }

    public function test_apartments_are_imported_with_their_place_and_prices(): void
    {
        $this->import($this->export());

        $apartment = Apartment::query()->where('legacy_id', 17)->sole();
        $this->assertSame('3c-apartman-(42)-bibione', $apartment->slug);
        $this->assertTrue($apartment->is_active);
        $this->assertSame('bibione', Location::query()->findOrFail($apartment->location_id)->slug);
        $this->assertSame(['B-5'], array_column($apartment->pricing_matrix['rows'], 'category'));

        $this->assertFalse(Apartment::query()->where('legacy_id', 527)->sole()->is_active);
    }

    /**
     * @param  array<string, mixed>  $export
     */
    private function import(array $export): void
    {
        $path = tempnam(sys_get_temp_dir(), 'legacy-export');
        file_put_contents($path, json_encode($export));

        $this->artisan('adria:legacy:import', ['file' => $path, '--only' => ['departure-places', 'tours', 'apartments'], '--media' => 'none', '--force' => true])->assertSuccessful();
        unlink($path);
    }

    /**
     * @return array<string, mixed>
     */
    private function export(): array
    {
        $seo = ['title' => '', 'description' => '', 'robots' => ''];
        $apartment = fn (int $id, string $name, string $seoName, string $active, array $selected): array => [
            'legacy_id' => (string) $id,
            'list' => ['ID' => (string) $id, 'Név' => $name, 'Apartman/Síszállás' => 'Apartman', 'Aktív?' => $active, 'Kiemelt?' => 'Nem kiemelt'],
            'fields' => [
                'id' => (string) $id, 'quality' => '3', 'seo' => $seo, 'name' => $name, 'seo_name' => $seoName, 'code' => '42',
                'code_min' => '42', 'code_max' => '42', 'address' => 'Via Maia 1, Bibione', 'coordinates_maps' => '(45.63, 13.06)',
                'description' => '<p>Tengerparti apartman</p>', 'services' => ['1' => '1', '4' => '1'],
                'price_table' => ['0' => ['2' => '2027-07-03'], '1' => ['2' => '2027-07-10'], '5' => ['0' => 'B-5', '1' => '3+2', '2' => '106']],
            ],
            'selected' => $selected,
        ];

        return [
            'meta' => ['exported_at' => '2026-11-03T18:06:12Z', 'base_url_for_files' => 'https://adriaholiday.hu/'],
            'entities' => [
                'roundtrip.felszallas' => ['records' => [[
                    'legacy_id' => '213', 'list' => ['ID' => '213', 'Név' => 'Budapest BOK Csarnok'],
                    'fields' => ['id' => '213', 'name' => 'Budapest BOK Csarnok', 'city' => 'Budapest', 'price' => '0'],
                ]]],
                'roundtrip.region' => ['records' => [[
                    'legacy_id' => '3', 'list' => ['ID' => '3', 'Név' => 'Svájc', 'Típus' => 'Régió'],
                    'fields' => ['id' => '3', 'seo' => $seo, 'name' => 'Svájc', 'seo_name' => 'svajc'],
                ]]],
                'roundtrip.offer_group' => ['records' => [[
                    'legacy_id' => '10', 'list' => ['ID' => '10', 'Név' => 'Körutazás', 'Menü' => 'Utazási ajánlatok'],
                    'fields' => ['id' => '10', 'seo' => $seo, 'name' => 'Körutazás', 'seo_name' => 'korutazas'],
                ]]],
                'roundtrip.offer' => ['records' => [[
                    'legacy_id' => '10',
                    'list' => ['ID' => '10', 'Kiemelt?' => 'Kiemelt', 'Aktív?' => 'Aktív', 'Képes ajánlat?' => 'Nem képes ajánlat', 'XML-ben szerepel?' => 'Igen'],
                    'fields' => [
                        'id' => '10', 'seo' => $seo, 'name' => 'Svájc, a hófödte Alpoktól', 'name_sub_1' => 'Luzern', 'name_sub_2' => '',
                        'seo_name' => 'svajc-a-hofodte-alpoktol', 'description' => '', 'cities_affected' => '<p>Luzern-Chamonix</p>',
                        'program' => '<p><b>1. nap:</b> indulás</p>', 'tickets' => '<p>Belépők: 40 CHF</p>', 'facultative' => '', 'price_text' => '',
                        'favorable_text' => '', 'slide_text' => '', 'slide_image' => '', 'regions' => ['3' => '1'], 'groups' => ['10' => '1'],
                    ],
                    'selected' => [],
                ]]],
                'apartment.region' => ['records' => [[
                    'legacy_id' => '50', 'list' => ['ID' => '50', 'Város' => 'Veneto', 'Ország' => 'Olaszország'],
                    'fields' => ['id' => '50', 'seo' => $seo, 'city' => 'Veneto', 'city_hu' => 'Veneto', 'seo_name' => 'veneto', 'country' => 'Olaszország', 'apartments_information' => ''],
                    'selected' => ['region_type' => '2'],
                ]]],
                'apartment.place' => ['records' => [[
                    'legacy_id' => '405', 'list' => ['ID' => '405', 'Név' => 'Bibione'],
                    'fields' => ['id' => '405', 'seo' => $seo, 'name' => 'Bibione', 'seo_name' => 'bibione', 'description' => '', 'description_bottom' => ''],
                    'selected' => ['location_id' => '50', 'location_type' => '2'],
                ]]],
                'apartment.apartment' => ['records' => [$apartment(17, '3C Apartman (42) Bibione', '3c-apartman-(42)-bibione', 'Aktív', ['place_id' => '405', 'location_id' => '50'])]],
                'apartment.apartment_croatia_new' => ['records' => [$apartment(527, 'IVANA - Punat', 'ivana---punat', 'Inaktív', ['place_id' => '405', 'location_id' => '50'])]],
            ],
            'relations' => [
                'roundtrip_offer_dates' => ['10' => [[
                    'date_id' => '12446',
                    'summary' => '2027-07-16 — 2027-07-20 | Autóbusszal | Hotel*** | reggeli | 238.400,- Ft | aktív',
                    'fields' => [
                        'date_id' => '12446', 'date_date_from' => '2027-07-16', 'date_date_to' => '2027-07-20', 'space_number' => '45',
                        'accommodation' => 'Hotel***', 'provision' => 'reggeli', 'price' => '238400', 'sale_price' => '0', 'comment' => '',
                        'felszallas' => ['213' => '1'],
                    ],
                    'selected' => ['status' => 'active', 'travel' => '1', 'xml_listed' => '1', 'space_number_monitoring' => '1', 'holiday_home' => '0'],
                    'extras' => [['legacy_id' => '2281', 'order' => 1, 'line' => 'Egyágyas felár | 65600 | Ft/fő | Egyágyas |']],
                ]]],
            ],
        ];
    }
}
