<?php

namespace App\Support;

/**
 * Trip length buckets offered by the public offer search, measured in calendar days
 * (a trip starting and ending on the same day lasts one day).
 */
enum TripDurationRange: string
{
    case Short = 'short';
    case Medium = 'medium';
    case Long = 'long';

    public function minDays(): int
    {
        return match ($this) {
            self::Short => 1,
            self::Medium => 5,
            self::Long => 9,
        };
    }

    public function maxDays(): ?int
    {
        return match ($this) {
            self::Short => 4,
            self::Medium => 8,
            self::Long => null,
        };
    }
}
