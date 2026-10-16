<?php

namespace App\Mail;

use App\Models\Apartment;
use App\Models\Booking;
use App\Support\Booking\ApartmentBookingMailData;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Confirms to the customer that their apartment booking request arrived and
 * what happens next (the office confirms it and sends the deposit invoice).
 */
class ApartmentBookingCustomerConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Booking $booking,
        public readonly Apartment $apartment,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Megkaptuk az apartmanfoglalásodat – {$this->apartment->name}");
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bookings.apartment-customer-confirmation',
            with: (new ApartmentBookingMailData($this->booking, $this->apartment))->toArray(),
        );
    }
}
