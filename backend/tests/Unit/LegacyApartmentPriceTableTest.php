<?php

namespace Tests\Unit;

use App\Support\Apartment\ApartmentPriceTable;
use App\Support\Legacy\Apartments\LegacyApartmentPriceTable;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\TestCase;

class LegacyApartmentPriceTableTest extends TestCase
{
    public function test_periods_come_in_date_order_and_type_list_rows_are_left_out(): void
    {
        $matrix = LegacyApartmentPriceTable::toPricingMatrix([
            '0' => ['2' => '2026-07-04', '3' => '2026-05-23'],
            '1' => ['2' => '2026-07-11', '3' => '2026-05-30'],
            '2' => ['0' => ' B-5'],
            '5' => ['0' => 'B-5', '1' => '3+2', '2' => '106', '3' => '53'],
        ]);

        $this->assertSame([
            ['id' => 'legacy-column-3', 'startDate' => '2026-05-23', 'endDate' => '2026-05-30'],
            ['id' => 'legacy-column-2', 'startDate' => '2026-07-04', 'endDate' => '2026-07-11'],
        ], $matrix['columns']);
        $this->assertSame([['id' => 'legacy-row-5', 'category' => 'B-5', 'beds' => '3+2', 'prices' => ['53', '106']]], $matrix['rows']);
    }

    public function test_a_last_day_years_after_the_first_is_read_in_the_first_days_year(): void
    {
        $matrix = LegacyApartmentPriceTable::toPricingMatrix([
            '0' => ['2' => '2024-06-29'],
            '1' => ['2' => '2043-07-06'],
            '5' => ['0' => 'B-4', '1' => '3+1', '2' => '90'],
        ]);

        $this->assertSame('2024-07-06', $matrix['columns'][0]['endDate']);
    }

    public function test_a_table_without_prices_is_no_matrix(): void
    {
        $this->assertNull(LegacyApartmentPriceTable::toPricingMatrix(['0' => ['2' => '2026-05-23'], '2' => ['0' => 'B-5']]));
        $this->assertNull(LegacyApartmentPriceTable::toPricingMatrix([]));
    }

    public function test_only_periods_not_yet_over_and_types_priced_in_them_are_upcoming(): void
    {
        $matrix = [
            'columns' => [['startDate' => '2026-09-26', 'endDate' => '2026-10-03'], ['startDate' => '2026-10-10', 'endDate' => '2026-10-17']],
            'rows' => [
                ['category' => 'B-5', 'beds' => '3+2', 'prices' => ['60', '55,5']],
                ['category' => 'C-6', 'beds' => '4+2', 'prices' => ['70', '']],
            ],
        ];

        $upcoming = ApartmentPriceTable::upcoming($matrix, CarbonImmutable::parse('2026-10-16'));

        $this->assertSame([['startDate' => '2026-10-10', 'endDate' => '2026-10-17']], $upcoming['periods']);
        $this->assertSame([['category' => 'B-5', 'beds' => '3+2', 'maxGuests' => 5, 'prices' => [55.5]]], $upcoming['rows']);
        $this->assertSame(55.5, ApartmentPriceTable::lowestUpcomingPrice($matrix, CarbonImmutable::parse('2026-10-16')));
        $this->assertSame(['periods' => [], 'rows' => []], ApartmentPriceTable::upcoming($matrix, CarbonImmutable::parse('2026-10-18')));
        $this->assertSame(6, ApartmentPriceTable::maxGuests($matrix));
        $this->assertSame(['B-5', 'C-6'], ApartmentPriceTable::categories($matrix));
    }
}
