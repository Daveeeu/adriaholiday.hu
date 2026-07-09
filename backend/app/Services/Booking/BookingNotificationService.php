<?php

namespace App\Services\Booking;

use App\Mail\NewTourBookingOfficeNotification;
use App\Mail\TourBookingCustomerConfirmation;
use App\Models\Booking;
use App\Models\EmailLog;
use App\Models\Tour;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Sends the office/customer notification emails for a new tour booking
 * and records every send attempt in the email_logs table, so staff can
 * see a booking's email history without checking the mail server.
 */
class BookingNotificationService
{
    public function sendNewBookingNotifications(Booking $booking, Tour $tour): void
    {
        if ($booking->booking_type !== 'tour_booking') {
            return;
        }

        $officeAddress = config('mail.office_notifications_address');

        if ($officeAddress) {
            $this->sendAndLog($booking, $officeAddress, new NewTourBookingOfficeNotification($booking, $tour));
        }

        if ($booking->email) {
            $this->sendAndLog($booking, $booking->email, new TourBookingCustomerConfirmation($booking, $tour));
        }
    }

    private function sendAndLog(Booking $booking, string $to, Mailable $mailable): void
    {
        $subject = $mailable->envelope()->subject ?? get_class($mailable);

        try {
            Mail::to($to)->send($mailable);

            EmailLog::create([
                'booking_id' => $booking->id,
                'mailable' => get_class($mailable),
                'to' => $to,
                'subject' => $subject,
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        } catch (Throwable $exception) {
            Log::warning('Failed to send booking notification email.', [
                'booking_id' => $booking->id,
                'message' => $exception->getMessage(),
            ]);

            EmailLog::create([
                'booking_id' => $booking->id,
                'mailable' => get_class($mailable),
                'to' => $to,
                'subject' => $subject,
                'status' => 'failed',
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
