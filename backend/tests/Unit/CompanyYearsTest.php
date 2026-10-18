<?php

namespace Tests\Unit;

use App\Support\CompanyYears;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\TestCase;

class CompanyYearsTest extends TestCase
{
    public function test_the_years_count_from_the_founding_day(): void
    {
        $this->assertSame(22, CompanyYears::count(CarbonImmutable::parse('2026-08-26 23:59')));
        $this->assertSame(23, CompanyYears::count(CarbonImmutable::parse('2026-08-27 00:01')));
        $this->assertSame(23, CompanyYears::count(CarbonImmutable::parse('2027-08-26')));
        $this->assertSame(24, CompanyYears::count(CarbonImmutable::parse('2027-08-27')));
    }

    public function test_the_placeholder_is_filled_in(): void
    {
        $this->assertSame('Több mint 23 éve, 23+ év tapasztalat', CompanyYears::fill('Több mint {evek} éve, {evek}+ év tapasztalat', CarbonImmutable::parse('2026-10-18')));
        $this->assertNull(CompanyYears::fill(null));
    }
}
