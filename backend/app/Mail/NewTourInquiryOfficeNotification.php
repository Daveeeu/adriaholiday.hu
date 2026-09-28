<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Tour;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewTourInquiryOfficeNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Booking $inquiry,
        public readonly Tour $tour,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Új csoportos ajánlatkérés – {$this->tour->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.bookings.new-inquiry-office-notification',
            with: [
                'inquiry' => $this->inquiry,
                'tour' => $this->tour,
                'address' => collect([
                    $this->inquiry->payload['postalCode'] ?? null,
                    $this->inquiry->city,
                    $this->inquiry->address,
                ])->filter()->implode(', '),
            ],
        );
    }
}
