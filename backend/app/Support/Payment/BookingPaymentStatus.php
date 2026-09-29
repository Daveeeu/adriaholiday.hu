<?php

namespace App\Support\Payment;

/**
 * Provider-independent state of one online payment attempt.
 */
final class BookingPaymentStatus
{
    /** Created locally, the provider has not accepted it (yet). */
    public const PENDING = 'pending';

    /** Accepted by the provider, waiting for the customer to pay. */
    public const STARTED = 'started';

    public const SUCCEEDED = 'succeeded';

    /** Cancelled by the customer, rejected, or expired unpaid. */
    public const FAILED = 'failed';

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [self::PENDING, self::STARTED, self::SUCCEEDED, self::FAILED];
    }

    public static function isFinal(string $status): bool
    {
        return in_array($status, [self::SUCCEEDED, self::FAILED], true);
    }
}
