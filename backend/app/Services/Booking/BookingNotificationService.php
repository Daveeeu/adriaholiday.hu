<?php

namespace App\Services\Booking;

use App\Mail\NewTourBookingOfficeNotification;
use App\Mail\NewTourInquiryOfficeNotification;
use App\Mail\TourBookingCustomerConfirmation;
use App\Models\Booking;
use App\Models\Tour;
use App\Services\Mail\LoggedMailer;

/**
 * Sends the office/customer notification emails for new tour bookings and
 * the office notification for group quote requests.
 */
class BookingNotificationService
{
    public function __construct(private readonly LoggedMailer $mailer) {}

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

    public function sendNewInquiryNotification(Booking $inquiry, Tour $tour): void
    {
        $officeAddress = config('mail.office_notifications_address');

        if ($officeAddress) {
            $this->mailer->send(new NewTourInquiryOfficeNotification($inquiry, $tour), $officeAddress, $inquiry->id);
        }
    }
}
