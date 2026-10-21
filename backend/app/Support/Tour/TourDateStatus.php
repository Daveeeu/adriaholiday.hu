<?php

namespace App\Support\Tour;

/**
 * Whether a tour date can be booked: on sale, full or called off.
 */
final class TourDateStatus
{
    public const AVAILABLE = 'available';

    public const SOLD_OUT = 'sold_out';

    public const CANCELLED = 'cancelled';

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [self::AVAILABLE, self::SOLD_OUT, self::CANCELLED];
    }

    /**
     * Statuses a date cannot be booked in; any other (including a date
     * still being planned) takes bookings.
     *
     * @return array<int, string>
     */
    public static function unbookable(): array
    {
        return [self::SOLD_OUT, self::CANCELLED];
    }

    public static function isBookable(?string $status): bool
    {
        return ! in_array($status, self::unbookable(), true);
    }
}
