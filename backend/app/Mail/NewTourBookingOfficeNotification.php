<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Tour;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewTourBookingOfficeNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Booking $booking,
        public readonly Tour $tour,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Új foglalás érkezett – {$this->tour->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.bookings.new-office-notification',
            with: [
                'booking' => $this->booking,
                'tour' => $this->tour,
            ],
        );
    }
}
