<?php

namespace App\Support\Booking;

use App\Models\Booking;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * When and how much the customer pays for a tour booking: the agency's
 * instalment rules, chosen by how far the departure is from the booking day.
 * The first instalment (the deposit, "előleg") also includes the insurances;
 * the rest ("hátralék") is never due later than 30 days before departure.
 * A trip cheaper than the instalment minimum is paid in full.
 */
final class BookingPaymentSchedule
{
    private const AFTER_BOOKING_HOURS = 'after_booking_hours';

    private const AFTER_BOOKING_DAYS = 'after_booking_days';

    private const BEFORE_DEPARTURE_DAYS = 'before_departure_days';

    /** Deadlines are the agency's local dates and times. */
    public const TIMEZONE = 'Europe/Budapest';

    /** The remainder is due at the latest this many days before departure (ÁSZF). */
    private const REMAINDER_DAYS_BEFORE_DEPARTURE = 30;

    /** A HUF trip price below this is paid in full, whenever the departure is. */
    public const INSTALMENTS_MIN_TRIP_TOTAL = 20000;

    /** @var array<int, array{0: int, 1: string, 2: int}> */
    private const FULL_PAYMENT = [[100, self::AFTER_BOOKING_HOURS, 24]];

    /**
     * From the farthest departure down: the fewest days to departure the plan
     * applies from, and its instalments as [percent of the trip price, due rule, value].
     *
     * @var array<int, array{minDays: int, instalments: array<int, array{0: int, 1: string, 2: int}>}>
     */
    private const PLANS = [
        ['minDays' => 151, 'instalments' => [[20, self::AFTER_BOOKING_HOURS, 48], [20, self::AFTER_BOOKING_DAYS, 90], [60, self::BEFORE_DEPARTURE_DAYS, 35]]],
        ['minDays' => 120, 'instalments' => [[20, self::AFTER_BOOKING_HOURS, 48], [20, self::AFTER_BOOKING_DAYS, 60], [60, self::BEFORE_DEPARTURE_DAYS, 35]]],
        ['minDays' => 35, 'instalments' => [[40, self::AFTER_BOOKING_HOURS, 48], [60, self::AFTER_BOOKING_DAYS, 60]]],
        ['minDays' => PHP_INT_MIN, 'instalments' => self::FULL_PAYMENT],
    ];

    /**
     * @param  array<int, array{number: int, title: string, percent: int, amount: float, includesInsurance: bool, dueAt: CarbonImmutable, dueRule: string, dueWithinHours: bool}>  $instalments
     */
    private function __construct(private readonly array $instalments) {}

    public static function of(CarbonInterface $bookedAt, CarbonInterface $departure, float $tripTotal, float $insuranceTotal, string $currency): self
    {
        $bookedAt = CarbonImmutable::instance($bookedAt)->setTimezone(self::TIMEZONE);
        $departure = CarbonImmutable::parse($departure->toDateString(), self::TIMEZONE);
        $isHuf = strtoupper($currency) === 'HUF';
        $plan = $isHuf && $tripTotal < self::INSTALMENTS_MIN_TRIP_TOTAL
            ? self::FULL_PAYMENT
            : self::plan($bookedAt, $departure)['instalments'];
        $decimals = $isHuf ? 0 : 2;

        $instalments = [];
        $scheduled = 0.0;
        $lastIndex = count($plan) - 1;

        foreach ($plan as $index => [$percent, $rule, $value]) {
            // The last instalment takes what rounding left over, so they add up to the trip price.
            $amount = $index === $lastIndex ? round($tripTotal - $scheduled, $decimals) : round($tripTotal * $percent / 100, $decimals);
            $scheduled += $amount;
            [$dueAt, $dueRule] = self::due($rule, $value, $bookedAt, $departure, $index === 0);

            $instalments[] = [
                'number' => $index + 1,
                'title' => match (true) {
                    $lastIndex === 0 => 'Teljes részvételi díj',
                    $index === 0 => '1. részlet – előleg',
                    default => ($index + 1).'. részlet',
                },
                'percent' => $percent,
                'amount' => $amount + ($index === 0 ? $insuranceTotal : 0.0),
                'includesInsurance' => $index === 0 && $insuranceTotal > 0,
                'dueAt' => $dueAt,
                'dueRule' => $dueRule,
                'dueWithinHours' => $rule === self::AFTER_BOOKING_HOURS,
            ];
        }

        return new self($instalments);
    }

    /**
     * The trip price share of the deposit (first instalment) for a booking made now:
     * what the customer pays online right after booking, besides the insurances.
     * A trip below the instalment minimum is paid in full regardless.
     */
    public static function depositPercent(CarbonInterface $departure, ?CarbonInterface $bookedAt = null): int
    {
        $bookedAt = CarbonImmutable::instance($bookedAt ?? now())->setTimezone(self::TIMEZONE);

        return self::plan($bookedAt, CarbonImmutable::parse($departure->toDateString(), self::TIMEZONE))['instalments'][0][0];
    }

    /**
     * The schedule of a tour booking with a stored price breakdown and a departure date.
     */
    public static function forBooking(Booking $booking): ?self
    {
        $pricing = BookingPriceSummary::of($booking);
        $departure = $booking->tourDate?->start_date ?? $booking->departure_date;

        if ($pricing?->tripTotalAmount() === null || $departure === null) {
            return null;
        }

        return self::of(
            $booking->created_at ?? now(),
            $departure,
            $pricing->tripTotalAmount(),
            $pricing->insuranceTotalAmount(),
            (string) $booking->currency ?: 'HUF',
        );
    }

    /**
     * @return array<int, array{number: int, title: string, percent: int, amount: float, includesInsurance: bool, dueAt: CarbonImmutable, dueRule: string, dueWithinHours: bool}>
     */
    public function instalments(): array
    {
        return $this->instalments;
    }

    /**
     * Each instalment with how much of it the payments so far cover; payments
     * settle the instalments in order.
     *
     * @return array<int, array{number: int, title: string, percent: int, amount: float, includesInsurance: bool, dueAt: CarbonImmutable, dueRule: string, dueWithinHours: bool, paidAmount: float, paid: bool, overdue: bool}>
     */
    public function withPayments(float $paidAmount, ?CarbonInterface $now = null): array
    {
        $now ??= now();
        $remaining = max(0.0, $paidAmount);

        return array_map(function (array $instalment) use (&$remaining, $now): array {
            $covered = min($remaining, $instalment['amount']);
            $remaining -= $covered;
            $paid = $covered >= $instalment['amount'];

            return [
                ...$instalment,
                'paidAmount' => $covered,
                'paid' => $paid,
                'overdue' => ! $paid && $instalment['dueAt']->lessThan($now),
            ];
        }, $this->instalments);
    }

    /**
     * @return array{minDays: int, instalments: array<int, array{0: int, 1: string, 2: int}>}
     */
    private static function plan(CarbonImmutable $bookedAt, CarbonImmutable $departure): array
    {
        $daysToDeparture = (int) $bookedAt->startOfDay()->diffInDays($departure, false);

        return collect(self::PLANS)->first(fn (array $plan): bool => $daysToDeparture >= $plan['minDays']);
    }

    /**
     * @return array{0: CarbonImmutable, 1: string} the deadline and how it is worded
     */
    private static function due(string $rule, int $value, CarbonImmutable $bookedAt, CarbonImmutable $departure, bool $first): array
    {
        $due = match ($rule) {
            self::AFTER_BOOKING_HOURS => $bookedAt->addHours($value),
            self::AFTER_BOOKING_DAYS => $bookedAt->startOfDay()->addDays($value),
            self::BEFORE_DEPARTURE_DAYS => $departure->subDays($value),
        };
        $label = match ($rule) {
            self::AFTER_BOOKING_HOURS => "a foglalás után {$value} órán belül",
            self::AFTER_BOOKING_DAYS => "a foglalás után {$value} nappal",
            self::BEFORE_DEPARTURE_DAYS => "az utazás előtt {$value} nappal",
        };

        if ($first) {
            return [$due->min($departure), $label];
        }

        // E.g. "60 days after booking" for a trip 50 days away: the remainder deadline applies.
        $latest = $departure->subDays(self::REMAINDER_DAYS_BEFORE_DEPARTURE)->max($bookedAt->startOfDay());

        return $due->greaterThan($latest)
            ? [$latest, 'az utazás előtt '.self::REMAINDER_DAYS_BEFORE_DEPARTURE.' nappal']
            : [$due, $label];
    }
}
