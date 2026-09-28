<?php

namespace Tests\Unit;

use App\Services\Legacy\LegacyBookingOptionsParser;
use PHPUnit\Framework\TestCase;

class LegacyBookingOptionsParserTest extends TestCase
{
    private function extraRow(int $id, string $label, string $price, string $inputAttributes = ''): string
    {
        return <<<HTML
            <div class="row">
                <div class="col-sm-4"><div class="checkbox"><label class="no-padding">
                    <div class="no-margin">
                        <input value="1" class="price_changer extra_price_changer" name="extra_price_changer[{$id}]" data-id="{$id}" type="checkbox" {$inputAttributes}>
                        <span class="cr"><i class="cr-icon fa fa-check"></i></span>
                        {$label}
                    </div>
                </label></div></div>
                <div class="col-sm-4"><p class="no-margin">{$price}</p></div>
                <div class="col-sm-4 text-right"><p class="no-margin extra_price_formated" id="extra_price_formated_{$id}">0 ,-Ft</p></div>
            </div>
            HTML;
    }

    public function test_it_parses_departure_places_with_their_per_person_price(): void
    {
        $options = (new LegacyBookingOptionsParser)->parse([
            'felszallas_items' => '<option value="">Kérem válasszon!</option><option value=228>164.500 Ft/fő Budapest BOK csarnok</option><option value=210>159.800 Ft/fő gyöngyösi indulással </option>',
            'extra_prices_items' => '',
        ]);

        $this->assertSame([
            ['name' => 'Budapest BOK csarnok', 'price' => 164500.0],
            ['name' => 'gyöngyösi indulással', 'price' => 159800.0],
        ], $options['departurePlaces']);
        $this->assertSame([], $options['extras']);
    }

    public function test_it_parses_extras_with_price_unit_charge_rule_and_single_room_choices(): void
    {
        $html = $this->extraRow(2239, 'vacsora', '8.800 Ft/fő')
            .$this->extraRow(2262, 'Repülőjegy', '30.000 Ft/fő', 'checked="checked" readonly="readonly" onclick="return false;"')
            .$this->extraRow(2240, 'egyágyas felár', '13.800 Ft', 'checked="checked" readonly="readonly" onclick="return false;" data-name="single_bad"')
            .'<div class="row single_bad_content"><div class="no-margin"><input name="single_bad_alone_in_the_room" type="checkbox"><span class="cr"></span> Egyedül szeretnék lenni a szobában</div></div>'
            .'<div class="row single_bad_content"><div class="no-margin"><input name="single_bad_like_a_roommate" type="checkbox"><span class="cr"></span> Szeretnék szobatársat <br> Amennyiben sikerül szobatársat találnunk, az egyágyas felár díját visszafizetjük <br><br></div></div>';

        $options = (new LegacyBookingOptionsParser)->parse(['felszallas_items' => '', 'extra_prices_items' => $html]);

        $this->assertSame([
            ['name' => 'Vacsora', 'price' => 8800.0, 'price_unit' => 'per_person', 'charge_rule' => 'optional', 'choices' => []],
            ['name' => 'Repülőjegy', 'price' => 30000.0, 'price_unit' => 'per_person', 'charge_rule' => 'mandatory', 'choices' => []],
            [
                'name' => 'Egyágyas felár',
                'price' => 13800.0,
                'price_unit' => 'per_booking',
                'charge_rule' => 'solo_traveller',
                'choices' => [
                    'Egyedül szeretnék lenni a szobában',
                    'Szeretnék szobatársat – amennyiben sikerül szobatársat találnunk, az egyágyas felár díját visszafizetjük',
                ],
            ],
        ], $options['extras']);
    }

    public function test_it_reads_resort_fees_and_last_minute_discount_from_the_price_quote(): void
    {
        $options = (new LegacyBookingOptionsParser)->parse(
            ['felszallas_items' => '', 'extra_prices_items' => ''],
            ['resort_fee_value_person' => '4900', 'resort_fee_eur_value_person' => '8', 'last_minute_value_text' => 10],
        );

        $this->assertSame([
            ['name' => 'Üdülőhelyi illeték', 'price' => 4900.0, 'price_unit' => 'per_person', 'charge_rule' => 'mandatory', 'choices' => []],
        ], $options['extras']);
        $this->assertSame(['Üdülőhelyi illeték: 8 EUR/fő, helyszínen fizetendő'], $options['onSiteFees']);
        $this->assertSame(10.0, $options['lastMinutePercent']);
    }

    public function test_a_quote_without_fees_or_discount_adds_nothing(): void
    {
        $options = (new LegacyBookingOptionsParser)->parse(
            ['felszallas_items' => '', 'extra_prices_items' => ''],
            ['resort_fee_value_person' => 0, 'resort_fee_eur_value_person' => 0, 'last_minute_value_text' => 0],
        );

        $this->assertSame([], $options['extras']);
        $this->assertSame([], $options['onSiteFees']);
        $this->assertNull($options['lastMinutePercent']);
    }
}
