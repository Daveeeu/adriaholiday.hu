<?php

namespace Tests\Unit;

use App\Support\HufPrice;
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
}
