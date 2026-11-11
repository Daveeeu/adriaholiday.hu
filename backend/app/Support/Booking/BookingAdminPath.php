<?php

namespace App\Support\Booking;

/**
 * The admin list a booking of each type is handled on (admin route paths).
 */
final class BookingAdminPath
{
    public static function for(?string $bookingType): string
    {
        return match ($bookingType) {
            'tour_booking' => '/bookings/tour-bookings',
            'tour_inquiry' => '/bookings/tour-inquiries',
            'apartment_booking' => '/bookings/apartment-bookings',
            default => '/bookings',
        };
    }
}
