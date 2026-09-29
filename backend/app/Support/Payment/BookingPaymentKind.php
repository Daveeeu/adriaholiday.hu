<?php

namespace App\Support\Payment;

/**
 * What part of the booking total an online payment covers.
 */
final class BookingPaymentKind
{
    public const FULL = 'full';

    public const DEPOSIT = 'deposit';

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [self::FULL, self::DEPOSIT];
    }
}
