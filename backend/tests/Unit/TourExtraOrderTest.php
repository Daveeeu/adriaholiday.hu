<?php

namespace Tests\Unit;

use App\Support\Tour\TourExtraOrder;
use PHPUnit\Framework\TestCase;

class TourExtraOrderTest extends TestCase
{
    public function test_supplements_follow_the_fixed_order_whatever_order_they_were_entered_in(): void
    {
        $entered = ['Egyágyas felár', '23 kg feladott poggyász', 'Repülőjegy', 'Reptéri illeték', 'Belépőjegyek', 'Vacsora', 'Üdülőhelyi illeték'];

        $this->assertSame(
            ['Üdülőhelyi illeték', 'Vacsora', 'Belépőjegyek', 'Repülőjegy', 'Reptéri illeték', '23 kg feladott poggyász', 'Egyágyas felár'],
            TourExtraOrder::sort($entered, fn (string $name): string => $name),
        );
    }

    public function test_names_are_matched_without_accents_and_case(): void
    {
        $this->assertSame(0, TourExtraOrder::rank('ÜDÜLŐHELYI ILLETÉK (helyszínen)'));
        $this->assertSame(1, TourExtraOrder::rank('Félpanziós ellátás'));
        $this->assertSame(5, TourExtraOrder::rank('Hajókirándulás'));
    }
}
