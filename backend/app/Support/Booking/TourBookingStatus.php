<?php

namespace App\Support\Booking;

/**
 * Status workflow for booking_type = 'tour_booking' records created via
 * the public dynamic booking form. Other booking types (tour_inquiry,
 * apartment_booking) keep their own separate status sets.
 */
final class TourBookingStatus
{
    public const NEW = 'new';

    public const CONTACTED = 'contacted';

    public const CONFIRMED = 'confirmed';

    public const CANCELLED = 'cancelled';

    public const EXPIRED = 'expired';

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [self::NEW, self::CONTACTED, self::CONFIRMED, self::CANCELLED, self::EXPIRED];
    }

    /**
     * @return array<int, string>
     */
    public static function allowedTransitions(string $currentStatus): array
    {
        return match ($currentStatus) {
            self::NEW => [self::CONTACTED, self::CONFIRMED, self::CANCELLED, self::EXPIRED],
            self::CONTACTED => [self::CONFIRMED, self::CANCELLED, self::EXPIRED],
            self::CONFIRMED => [self::CANCELLED],
            self::CANCELLED, self::EXPIRED => [],
            default => self::all(),
        };
    }

    public static function canTransition(string $from, string $to): bool
    {
        if ($from === $to) {
            return true;
        }

        return in_array($to, self::allowedTransitions($from), true);
    }
}
