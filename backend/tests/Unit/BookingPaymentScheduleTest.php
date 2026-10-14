<?php

namespace Tests\Unit;

use App\Support\Booking\BookingPaymentSchedule;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class BookingPaymentScheduleTest extends TestCase
{
    private const BOOKED_AT = '2026-03-02 10:15:00';

    /**
     * @return array<int, array{0: string, 1: float, 2: float}>
     */
    private function instalments(int $daysToDeparture, float $tripTotal = 100000, float $insuranceTotal = 0): array
    {
        $bookedAt = CarbonImmutable::parse(self::BOOKED_AT, BookingPaymentSchedule::TIMEZONE);

        return array_map(
            fn (array $instalment): array => [$instalment['dueAt']->format('Y-m-d H:i'), $instalment['amount'], $instalment['percent']],
            BookingPaymentSchedule::of($bookedAt, $bookedAt->addDays($daysToDeparture), $tripTotal, $insuranceTotal, 'HUF')->instalments(),
        );
    }

    public function test_a_departure_more_than_150_days_away_is_paid_in_three_instalments(): void
    {
        $this->assertSame([
            ['2026-03-04 10:15', 20000.0, 20],
            ['2026-05-31 00:00', 20000.0, 20],
            ['2026-08-06 00:00', 60000.0, 60],
        ], $this->instalments(192));
    }

    public function test_a_departure_120_to_150_days_away_pays_the_second_instalment_60_days_after_booking(): void
    {
        $this->assertSame([
            ['2026-03-04 10:15', 20000.0, 20],
            ['2026-05-01 00:00', 20000.0, 20],
            ['2026-06-10 00:00', 60000.0, 60],
        ], $this->instalments(135));
    }

    public function test_a_departure_35_to_120_days_away_pays_a_40_percent_deposit_and_the_rest_later(): void
    {
        $this->assertSame([
            ['2026-03-04 10:15', 40000.0, 40],
            ['2026-05-01 00:00', 60000.0, 60],
        ], $this->instalments(100));
    }

    public function test_the_rest_is_due_30_days_before_departure_when_60_days_after_booking_would_be_later(): void
    {
        $instalments = BookingPaymentSchedule::of(
            CarbonImmutable::parse(self::BOOKED_AT, BookingPaymentSchedule::TIMEZONE),
            CarbonImmutable::parse('2026-04-21'),
            100000,
            0,
            'HUF',
        )->instalments();

        $this->assertSame('2026-03-22', $instalments[1]['dueAt']->toDateString());
        $this->assertSame('az utazás előtt 30 nappal', $instalments[1]['dueRule']);
    }

    #[DataProvider('shortNoticeDays')]
    public function test_a_departure_within_35_days_is_paid_in_full_within_24_hours(int $days): void
    {
        $this->assertSame([['2026-03-03 10:15', 100000.0, 100]], $this->instalments($days));
    }

    /**
     * @return array<string, array{0: int}>
     */
    public static function shortNoticeDays(): array
    {
        return ['34 days' => [34], '20 days' => [20], '5 days' => [5]];
    }

    public function test_a_trip_below_the_instalment_minimum_is_paid_in_full_within_24_hours(): void
    {
        $this->assertSame([['2026-03-03 10:15', 19999.0, 100]], $this->instalments(192, tripTotal: 19999, insuranceTotal: 0));
        $this->assertSame([['2026-03-03 10:15', 22999.0, 100]], $this->instalments(192, tripTotal: 19999, insuranceTotal: 3000));
        $this->assertCount(3, $this->instalments(192, tripTotal: 20000));
    }

    public function test_the_plan_boundaries_follow_the_agency_rules(): void
    {
        $this->assertCount(3, $this->instalments(151));
        $this->assertSame(20, $this->instalments(150)[0][2]);
        $this->assertSame(40, $this->instalments(119)[0][2]);
        $this->assertSame(20, $this->instalments(120)[0][2]);
        $this->assertSame(40, $this->instalments(35)[0][2]);
        $this->assertSame(100, $this->instalments(34)[0][2]);
    }

    public function test_the_insurances_are_paid_with_the_deposit_and_rounding_never_loses_a_forint(): void
    {
        $instalments = $this->instalments(200, tripTotal: 99999, insuranceTotal: 4320);

        $this->assertSame([24320.0, 20000.0, 59999.0], array_column($instalments, 1));
    }

    public function test_payments_settle_the_instalments_in_order(): void
    {
        $bookedAt = CarbonImmutable::parse(self::BOOKED_AT, BookingPaymentSchedule::TIMEZONE);
        $schedule = BookingPaymentSchedule::of($bookedAt, $bookedAt->addDays(200), 100000, 0, 'HUF');

        $instalments = $schedule->withPayments(30000, $bookedAt->addDays(100));

        $this->assertTrue($instalments[0]['paid']);
        $this->assertFalse($instalments[1]['paid']);
        $this->assertSame(10000.0, $instalments[1]['paidAmount']);
        $this->assertTrue($instalments[1]['overdue']);
        $this->assertFalse($instalments[2]['overdue']);
    }
}
