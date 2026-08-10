<?php

namespace App\Services\Booking;

use App\Mail\NewTourBookingOfficeNotification;
use App\Mail\TourBookingCustomerConfirmation;
use App\Models\Booking;
use App\Models\Tour;
use App\Services\Mail\LoggedMailer;

/**
 * Sends the office/customer notification emails for a new tour booking.
 */
class BookingNotificationService
{
    public function __construct(private readonly LoggedMailer $mailer)
    {
    }

    public function sendNewBookingNotifications(Booking $booking, Tour $tour): void
    {
        if ($booking->booking_type !== 'tour_booking') {
            return;
        }

        $officeAddress = config('mail.office_notifications_address');

        if ($officeAddress) {
            $this->mailer->send(new NewTourBookingOfficeNotification($booking, $tour), $officeAddress, $booking->id);
        }

        if ($booking->email) {
            $this->mailer->send(new TourBookingCustomerConfirmation($booking, $tour), $booking->email, $booking->id);
        }
    }
}
