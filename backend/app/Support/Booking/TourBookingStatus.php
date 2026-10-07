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
     * The status as the admin shows it.
     */
    public static function label(string $status): string
    {
        return match ($status) {
            self::NEW => 'Új',
            self::CONTACTED => 'Felvéve a kapcsolat',
            self::CONFIRMED => 'Megerősítve',
            self::CANCELLED => 'Lemondva',
            self::EXPIRED => 'Lejárt',
            default => $status,
        };
    }

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
