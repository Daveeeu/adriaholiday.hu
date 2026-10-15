<?php

namespace Tests\Unit;

use App\Services\Legacy\LegacyAdminOfferReader;
use App\Support\Tour\TourDateStatus;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraPriceUnit;
use Tests\TestCase;

class LegacyAdminOfferReaderTest extends TestCase
{
    /**
     * @return array<string, mixed>
     */
    private function offer(): array
    {
        $date = fn (string $from, string $status, string $monitoring, string $seats, array $extra = []): array => [
            'id' => $from,
            'fields' => [
                'date_date_from' => $from,
                'date_date_to' => $from,
                'status' => ['value' => $status, 'text' => ''],
                'space_number_monitoring' => ['value' => $monitoring, 'text' => ''],
                'space_number' => $seats,
                'travel' => ['value' => '1', 'text' => 'Autóbusszal'],
                'accommodation' => 'apartman',
                'accommodation_info' => '<p>5-6 fős apartmanok</p>',
                'provision' => 'önellátás',
                'provision_info' => '<p>önellátás</p>',
                'price' => '84900',
                'sale_price' => '74900',
                'resort_fee' => '2800',
                'last_minute' => '',
                'comment' => 'Pünkösd',
                '__checked' => ['felszallas[73]' => 'miskolci indulással(+0 Ft/fő)', 'felszallas[228]' => 'Budapest BOK csarnok(+4700 Ft/fő)'],
                ...$extra,
            ],
            'extras' => [
                ['id' => '1', 'line' => 'Vacsora | 38900 | Ft/fő | Választható |'],
                ['id' => '2', 'line' => '1 ágyas felár | 59800 | Ft/fő | Egyágyas |'],
                ['id' => '3', 'line' => 'Repülőjegy | 80000 | Ft/fő | Előre kiválasztott |'],
            ],
        ];

        return [
            'form' => [
                'seo_name' => 'napfenyes-italia-2018',
                'name' => 'Napfényes Itália 4 nap',
                'name_sub_1' => 'tengerparti üdülés városlátogatásokkal',
                'name_sub_2' => '',
                'cities_affected' => 'Trieszt-Velence',
                'program' => '<h2>Napfényes Itália</h2><p><strong>4.NAP AQUILEIA</strong></p><p>Igény esetén választható:</p><p>a., Bledi tó</p><table><tr><td>Velence</td><td>45 Euro/fő</td></tr></table>',
                'tickets' => '<p>Belépők</p>',
                'facultative' => '',
                'favorable_text' => '<p>Kedvcsináló</p>',
                'price_text' => '',
                'coupon_enabled' => '0',
            ],
            'dates' => [
                $date('2027-05-16', 'active', '1', '45'),
                $date('2027-05-01', 'full', '0', '0'),
                $date('2027-06-01', 'inactive', '0', '0'),
                $date('2027-07-01', 'active', '1', '0'),
            ],
        ];
    }

    public function test_texts_are_taken_word_for_word_with_the_program_as_one_block(): void
    {
        $data = (new LegacyAdminOfferReader)->read($this->offer());

        $this->assertSame('tengerparti üdülés városlátogatásokkal', $data['subtitle']);
        $this->assertSame('Trieszt-Velence', $data['short_description']);
        $this->assertStringContainsString('a., Bledi tó', (string) $data['program']);
        $this->assertStringContainsString('<table>', (string) $data['program']);
        $this->assertSame('<p>Kedvcsináló</p>', $data['teaser']);
        $this->assertNull($data['optional_programs']);
        $this->assertFalse($data['couponable']);
        $this->assertSame('bus', $data['travel_mode']);
        $this->assertSame('5-6 fős apartmanok', $data['accommodation_info']);
        $this->assertNull($data['catering_info']);
    }

    public function test_dates_keep_prices_labels_seats_extras_and_departure_places(): void
    {
        $dates = (new LegacyAdminOfferReader)->read($this->offer())['dates'];

        // The inactive date is not listed on the legacy site.
        $this->assertSame(['2027-05-01', '2027-05-16', '2027-07-01'], array_column($dates, 'start_date'));
        [$full, $open, $noSeats] = $dates;

        $this->assertSame(TourDateStatus::SOLD_OUT, $full['status']);
        $this->assertNull($full['available_seats']);
        $this->assertSame(TourDateStatus::AVAILABLE, $open['status']);
        $this->assertSame(45, $open['available_seats']);
        $this->assertSame(TourDateStatus::SOLD_OUT, $noSeats['status']);
        $this->assertSame([74900.0, 84900.0, 'Pünkösd'], [$open['price'], $open['original_price'], $open['label']]);
        $this->assertSame([
            ['name' => 'Vacsora', 'price' => 38900.0, 'currency' => 'HUF', 'price_unit' => TourExtraPriceUnit::PER_PERSON, 'charge_rule' => TourExtraChargeRule::OPTIONAL],
            ['name' => '1 ágyas felár', 'price' => 59800.0, 'currency' => 'HUF', 'price_unit' => TourExtraPriceUnit::PER_PERSON, 'charge_rule' => TourExtraChargeRule::SOLO_TRAVELLER],
            ['name' => 'Repülőjegy', 'price' => 80000.0, 'currency' => 'HUF', 'price_unit' => TourExtraPriceUnit::PER_PERSON, 'charge_rule' => TourExtraChargeRule::MANDATORY],
            ['name' => 'Üdülőhelyi illeték', 'price' => 2800.0, 'currency' => 'HUF', 'price_unit' => TourExtraPriceUnit::PER_PERSON, 'charge_rule' => TourExtraChargeRule::MANDATORY],
        ], $open['extras']);
        $this->assertSame([['name' => 'miskolci indulással', 'fee' => 0.0], ['name' => 'Budapest BOK csarnok', 'fee' => 4700.0]], $open['departure_places']);
    }
}
