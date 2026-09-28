<?php

namespace App\Support\Booking;

/**
 * Rules of group quote requests ("egyedi időpont / ajánlatkérés") stored as
 * bookings with booking_type = tour_inquiry.
 */
final class TourInquiry
{
    public const BOOKING_TYPE = 'tour_inquiry';

    public const MIN_PASSENGERS = 20;
}
