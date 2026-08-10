<?php

namespace App\Services\Mail;

use App\Models\EmailLog;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Sends a Mailable and records every send attempt in the email_logs table,
 * so staff can see an entity's email history without checking the mail server.
 */
class LoggedMailer
{
    public function send(Mailable $mailable, string $to, ?int $bookingId = null): void
    {
        $subject = $mailable->envelope()->subject ?? get_class($mailable);

        try {
            Mail::to($to)->send($mailable);

            EmailLog::create([
                'booking_id' => $bookingId,
                'mailable' => get_class($mailable),
                'to' => $to,
                'subject' => $subject,
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        } catch (Throwable $exception) {
            Log::warning('Failed to send email.', [
                'mailable' => get_class($mailable),
                'to' => $to,
                'message' => $exception->getMessage(),
            ]);

            EmailLog::create([
                'booking_id' => $bookingId,
                'mailable' => get_class($mailable),
                'to' => $to,
                'subject' => $subject,
                'status' => 'failed',
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
