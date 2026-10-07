<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Tour;
use App\Support\Booking\BookingDocumentData;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Confirms a tour booking to the customer with everything they booked (see
 * BookingDocumentData).
 */
class TourBookingCustomerConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Booking $booking,
        public readonly Tour $tour,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Foglalás visszaigazolás – {$this->tour->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bookings.customer-confirmation',
            with: (new BookingDocumentData($this->booking, $this->tour))->toArray(),
        );
    }
}
