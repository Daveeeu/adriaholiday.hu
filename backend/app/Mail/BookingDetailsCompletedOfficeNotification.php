<?php

namespace App\Mail;

use App\Models\Booking;
use App\Support\Mail\AdminUrl;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Tells the office that a customer gave the booking details they had left
 * for later.
 */
class BookingDetailsCompletedOfficeNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array<int, array{title: string, fields: array<int, string>}>  $given
     */
    public function __construct(
        public readonly Booking $booking,
        public readonly array $given,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Megérkeztek a hiányzó adatok: #{$this->booking->id} {$this->booking->offer_name_snapshot}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bookings.details-completed-office-notification',
            with: [
                'adminUrl' => AdminUrl::to('/bookings/tour-bookings/'.$this->booking->id),
            ],
        );
    }
}
