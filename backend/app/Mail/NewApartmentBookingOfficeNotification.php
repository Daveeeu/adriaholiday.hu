<?php

namespace App\Mail;

use App\Models\Apartment;
use App\Models\Booking;
use App\Support\Booking\ApartmentBookingMailData;
use App\Support\Mail\AdminUrl;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Tells the office about a new apartment booking request.
 */
class NewApartmentBookingOfficeNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Booking $booking,
        public readonly Apartment $apartment,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Új apartmanfoglalás – {$this->apartment->name}");
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bookings.new-apartment-office-notification',
            with: [
                ...(new ApartmentBookingMailData($this->booking, $this->apartment))->toArray(),
                'adminUrl' => AdminUrl::to('/bookings/apartment-bookings'),
            ],
        );
    }
}
