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
}
