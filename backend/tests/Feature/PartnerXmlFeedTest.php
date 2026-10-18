<?php

namespace Tests\Feature;

use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Support\Tour\TourDateStatus;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraCurrency;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use SimpleXMLElement;
use Tests\TestCase;

class PartnerXmlFeedTest extends TestCase
{
    use RefreshDatabase;

    private Tour $tour;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-10-18 12:00:00');

        $this->tour = $this->tour([
            'legacy_id' => 20,
            'name' => 'Dél-Erdély és a Vaskapu-szoros',
            'short_description' => 'Arad - Temesvár - Fogarasi havasok',
            'program' => '<p>1. nap</p>',
            'tickets' => '<p>Belépők</p>',
            'optional_programs' => null,
            'list_description' => null,
            'catering' => 'reggeli',
            'accommodation' => 'Hotel***',
            'travel_mode_id' => 'bus',
            'partner_xml' => [
                'country_id' => 12,
                'country_name' => 'Erdély',
                'accommodation_name' => 'Dél-Erdélyi kirándulás',
                'city' => 'Erdély',
                'insurance_value' => 430,
                'accommodation_description_travelmax' => '<p>Hotelek</p>',
                'travel_types' => ['general' => 1, 'travelgate' => 2, 'cesys' => 3, 'travelmax' => [1, 16]],
            ],
        ]);

        $date = $this->date($this->tour, ['legacy_id' => 12139, 'start_date' => '2027-05-26', 'end_date' => '2027-05-30', 'price' => 179600, 'partner_xml' => ['cesys_accommodation' => 'Hotel***', 'cesys_room' => '2 ágyas']]);
        $this->extra($date, 'Üdülőhelyi illeték', 3800, TourExtraChargeRule::MANDATORY);
        $this->extra($date, 'Vacsora 4 alkalom', 30000, TourExtraChargeRule::OPTIONAL);
        $this->extra($date, 'Repülőjegy', 90000, TourExtraChargeRule::MANDATORY);
        $this->extra($date, 'Parkolás', 5000, TourExtraChargeRule::OPTIONAL, TourExtraPriceUnit::PER_BOOKING);

        $budapest = TourDeparturePlace::factory()->create(['name' => 'Budapest BOK Csarnok', 'active' => true]);
        $miskolc = TourDeparturePlace::factory()->create(['name' => 'Miskolc, Centrum', 'active' => true]);
        $this->tour->departurePlaces()->attach([$budapest->id => ['fee' => 0], $miskolc->id => ['fee' => 2000]]);

        // Not in the feeds: departed, sold out, cancelled, or taken out of the XML.
        $this->date($this->tour, ['start_date' => '2026-09-01', 'end_date' => '2026-09-05']);
        $this->date($this->tour, ['start_date' => '2027-06-01', 'end_date' => '2027-06-05', 'status' => TourDateStatus::SOLD_OUT]);
        $this->date($this->tour, ['start_date' => '2027-07-01', 'end_date' => '2027-07-05', 'status' => TourDateStatus::CANCELLED]);
        $this->date($this->tour, ['start_date' => '2027-08-01', 'end_date' => '2027-08-05', 'xml_enabled' => false]);

        // Tours not in the feeds.
        $this->tour(['name' => 'Inaktív', 'active' => false]);
        $this->tour(['name' => 'Nem XML', 'xml_enabled' => false]);
    }

    public function test_the_travelgate_feed_lists_every_party_size_with_the_items_for_the_whole_party(): void
    {
        $xml = $this->feed('/xmltravel');

        $this->assertCount(1, $xml->tour);
        $tour = $xml->tour[0];
        $this->assertSame('20', (string) $tour->tour_id);
        $this->assertSame('Dél-Erdély és a Vaskapu-szoros', (string) $tour->tour_title);
        $this->assertSame('Városlátogatás', (string) $tour->tour_category['name']);
        $this->assertSame('', (string) $tour->tour_category['id']);
        $this->assertSame('12', (string) $tour->country['id']);
        $this->assertSame('Erdély', (string) $tour->country);
        $this->assertSame('Arad,Temesvár,Fogarasihavasok', (string) $tour->place);
        $this->assertSame(['A program', 'fakultatív program', 'belépők', 'leírás'], $this->attributeList($tour->description->paragraph, 'name'));
        $this->assertSame('<p>1. nap</p>', (string) $tour->description->paragraph[0]);

        $this->assertCount(1, $tour->travel);
        $travel = $tour->travel[0];
        $this->assertSame(['20', '2027-05-26', '2027-05-30', '5', '4', 'reggeli'], [(string) $travel['id'], (string) $travel['start'], (string) $travel['end'], (string) $travel['day'], (string) $travel['night'], (string) $travel['board_name']]);
        $flight = $travel->hotelandroomgroup->flight;
        $this->assertSame('Autóbusszal', (string) $flight['type']);
        $this->assertCount(24, $flight->roomtype);

        // Two adults and a child.
        $party = $flight->roomtype[5];
        $this->assertSame(['Hotel***', '2', '1'], [(string) $party['name'], (string) $party['adult'], (string) $party['child1']]);
        $this->assertSame([
            ['Alapár', '1', '3', 'Ft', 'fő', '2.8', '179600'],
            ['Üdülőhelyi illeték Ft/fő', '0', '3', 'Ft', 'fő', '2.8', '3800'],
            ['Felszállási díj-Budapest BOK Csarnok', '0', '3', 'Ft', 'fő', '2.8', '0'],
            ['Felszállási díj-Miskolc, Centrum', '0', '3', 'Ft', 'fő', '2.8', '2000'],
            ['Felár  - Vacsora 4 alkalom', '0', '3', 'Ft', 'Ft/fő', '2.8', '30000'],
            ['Felár  - Repülőjegy', '1', '3', 'Ft', 'Ft/fő', '2.8', '90000'],
            ['Felár  - Parkolás', '0', '1', 'Ft', 'Ft', '2.8', '5000'],
        ], $this->prices($party));
    }

    public function test_the_travelmax_feed_adds_its_categories_the_travel_insurance_and_the_accommodation_description(): void
    {
        $tour = $this->feed('/xmltravelmax')->tour[0];

        $this->assertSame('1;16', (string) $tour->tour_category['id']);
        $this->assertSame('Körutazás;Adventi út', (string) $tour->tour_category['name']);
        $this->assertSame('<p>Hotelek</p>', (string) $tour->description->paragraph[4]);
        $this->assertSame('szállás leírás', (string) $tour->description->paragraph[4]['name']);

        $prices = $this->prices($tour->travel[0]->hotelandroomgroup->flight->roomtype[0]);
        $this->assertSame(['Üdülőhelyi illeték Ft/fő', '1', '1', 'Ft', 'fő', '2.8', '3800'], $prices[1]);
        // 540 Ft per person and day by default, for 1 person and 5 days.
        $this->assertSame(['Utasbiztosítás', '0', '5', 'Ft', 'fő/nap', '0', '540'], $prices[2]);
    }

    public function test_the_cesys_feed_offers_one_party_of_two_with_the_cesys_accommodation(): void
    {
        $tour = $this->feed('/xmlcesys')->tour[0];

        $this->assertSame('Városlátogatás', (string) $tour->tour_category['name']);
        $this->assertCount(0, $tour->accommodation);
        $travel = $tour->travel[0];
        $this->assertSame('Hotel***', (string) $travel['accommodation']);
        $this->assertCount(1, $travel->hotelandroomgroup->flight->roomtype);
        $party = $travel->hotelandroomgroup->flight->roomtype[0];
        $this->assertSame(['2 ágyas', '2', '0'], [(string) $party['name'], (string) $party['adult'], (string) $party['child1']]);
        $this->assertSame(['Üdülőhelyi illeték Ft/fő', '1', '2', 'Ft', 'fő', '2.8', '3800'], $this->prices($party)[1]);
    }

    public function test_the_general_feed_lists_one_price_per_date(): void
    {
        $offer = $this->feed('/xml')->traveloffer[0];

        $this->assertSame('20', (string) $offer->id);
        $this->assertSame('Erdély', (string) $offer->destination->city);
        $this->assertSame('12', (string) $offer->destination->country['id']);
        $this->assertSame('Dél-Erdélyi kirándulás', (string) $offer->accommodation);
        $this->assertSame('3', (string) $offer->accommodation['stars']);
        $this->assertSame(['1', 'Körutazás'], [(string) $offer->travel_type['id'], (string) $offer->travel_type]);
        $this->assertSame(['2', 'Reggeli'], [(string) $offer->board['id'], (string) $offer->board]);
        $this->assertSame('430', (string) $offer->prices->insurance_value);
        $this->assertCount(1, $offer->prices->datas);
        $this->assertSame(['12139', '2027-05-26', '2027-05-30', '179600', 'Ft', 'Ft/fő'], [
            (string) $offer->prices->datas['id'], (string) $offer->prices->datas->fromdate, (string) $offer->prices->datas->todate,
            (string) $offer->prices->datas->price, (string) $offer->prices->datas->currency, (string) $offer->prices->datas->price_type,
        ]);
    }

    public function test_a_tour_of_the_new_site_gets_an_id_no_legacy_tour_has_and_the_feed_follows_changes(): void
    {
        $this->assertCount(1, $this->feed('/xml')->traveloffer);

        $new = $this->tour(['name' => 'Új út']);
        $this->date($new, ['start_date' => '2027-04-01', 'end_date' => '2027-04-03']);

        $ids = $this->attributeList($this->feed('/xml')->traveloffer, null, 'id');
        $this->assertSame(['20', (string) (100000 + $new->id)], $ids);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function tour(array $attributes): Tour
    {
        return Tour::factory()->create([
            'region_id' => Region::factory(),
            'active' => true,
            'xml_enabled' => true,
            'price_box_currency' => TourExtraCurrency::HUF,
            ...$attributes,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function date(Tour $tour, array $attributes): TourDate
    {
        return TourDate::factory()->for($tour)->create([
            'status' => TourDateStatus::AVAILABLE,
            'xml_enabled' => true,
            'price' => 100000,
            'price_box_price' => $attributes['price'] ?? 100000,
            'departure_place_ids' => null,
            'accommodation' => null,
            'catering' => null,
            ...$attributes,
        ]);
    }

    private function extra(TourDate $date, string $name, int $price, string $rule, string $unit = TourExtraPriceUnit::PER_PERSON): void
    {
        TourDateExtra::factory()->for($date, 'tourDate')->create([
            'name' => $name,
            'price' => $price,
            'charge_rule' => $rule,
            'price_unit' => $unit,
            'currency' => TourExtraCurrency::HUF,
            'sort_order' => TourDateExtra::query()->where('tour_date_id', $date->id)->count() + 1,
        ]);
    }

    private function feed(string $path): SimpleXMLElement
    {
        $response = $this->get($path)->assertOk()->assertHeader('Content-Type', 'text/xml; charset=UTF-8');

        return new SimpleXMLElement($response->getContent(), LIBXML_NOCDATA);
    }

    /**
     * @return list<list<string>>
     */
    private function prices(SimpleXMLElement $roomType): array
    {
        $prices = [];

        foreach ($roomType->price as $price) {
            $prices[] = [(string) $price['name'], (string) $price['mandatory'], (string) $price['amount'], (string) $price['currency'], (string) $price['unit'], (string) $price['storno'], (string) $price['catalogueprice']];
        }

        return $prices;
    }

    /**
     * @return list<string>
     */
    private function attributeList(SimpleXMLElement $elements, ?string $attribute, ?string $child = null): array
    {
        $values = [];

        foreach ($elements as $element) {
            $values[] = $child !== null ? (string) $element->{$child} : (string) $element[$attribute];
        }

        return $values;
    }
}
