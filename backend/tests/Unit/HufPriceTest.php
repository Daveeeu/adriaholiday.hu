<?php

namespace Tests\Unit;

use App\Support\HufPrice;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class HufPriceTest extends TestCase
{
    public function test_it_formats_amounts_with_a_dot_thousands_separator(): void
    {
        $this->assertSame('68.900 Ft', HufPrice::format(68900));
        $this->assertSame('1.250.000 Ft', HufPrice::format(1250000.4));
        $this->assertSame('900 Ft', HufPrice::format(900));
        $this->assertSame('68.900', HufPrice::amount(68900));
    }

    #[DataProvider('labels')]
    public function test_it_normalizes_hand_typed_price_labels(?string $label, ?string $expected): void
    {
        $this->assertSame($expected, HufPrice::normalizeLabel($label));
    }

    /**
     * @return array<string, array{?string, ?string}>
     */
    public static function labels(): array
    {
        return [
            'bare number' => ['68900', '68.900 Ft'],
            'spaced number' => ['68 900', '68.900 Ft'],
            'old dash style' => ['68.900,-', '68.900 Ft'],
            'spaced with currency' => ['68 900 Ft', '68.900 Ft'],
            'non-breaking space' => ["68\u{00A0}900 Ft", '68.900 Ft'],
            'dash and currency' => ['68 900,- Ft', '68.900 Ft'],
            'HUF' => ['68900 HUF', '68.900 Ft'],
            'already formatted' => ['68.900 Ft', '68.900 Ft'],
            'with suffix' => ['68900 Ft/fő-től', '68.900 Ft/fő-től'],
            'with prefix' => ['Már 68 900 Ft-tól', 'Már 68.900 Ft-tól'],
            'text only' => ['Ár hamarosan', 'Ár hamarosan'],
            'year kept' => ['2027-es ár: 68900 Ft', '2027-es ár: 68.900 Ft'],
            'empty' => ['  ', null],
            'null' => [null, null],
        ];
    }
}
