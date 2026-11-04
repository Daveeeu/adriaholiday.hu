<?php

namespace App\Mail;

use App\Models\Booking;
use App\Support\Mail\EmailCompany;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Asks the customer for the booking details they left for later, with the
 * link to the page where they can give them (see BookingDetailsRequestService).
 */
class BookingDetailsRequest extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array<int, array{title: string, fields: array<int, string>}>  $missing
     */
    public function __construct(
        public readonly Booking $booking,
        public readonly string $url,
        public readonly array $missing,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Hiányzó adatok a foglalásodhoz: {$this->booking->offer_name_snapshot}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bookings.details-request',
            with: [
                'tripName' => (string) $this->booking->offer_name_snapshot,
                'customerName' => $this->booking->customer_name ?: 'Utazó',
                'company' => EmailCompany::resolve(),
            ],
        );
    }
}
