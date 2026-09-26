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

    public function test_it_parses_extras_with_price_unit_and_mandatory_flag(): void
    {
        $html = $this->extraRow(2239, 'vacsora', '8.800 Ft/fő')
            .$this->extraRow(2262, 'Repülőjegy', '30.000 Ft/fő', 'checked="checked" readonly="readonly" onclick="return false;"')
            .$this->extraRow(2240, 'egyágyas felár', '13.800 Ft', 'checked="checked" readonly="readonly" onclick="return false;" data-name="single_bad"')
            .'<div class="row single_bad_content"><input name="single_bad_alone_in_the_room" type="checkbox"> Egyedül szeretnék lenni a szobában</div>';

        $options = (new LegacyBookingOptionsParser)->parse(['felszallas_items' => '', 'extra_prices_items' => $html]);

        $this->assertSame([
            ['name' => 'Vacsora', 'price' => 8800.0, 'price_unit' => 'per_person', 'mandatory' => false],
            ['name' => 'Repülőjegy', 'price' => 30000.0, 'price_unit' => 'per_person', 'mandatory' => true],
            ['name' => 'Egyágyas felár', 'price' => 13800.0, 'price_unit' => 'per_booking', 'mandatory' => false],
        ], $options['extras']);
    }
}
