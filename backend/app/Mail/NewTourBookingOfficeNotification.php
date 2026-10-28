<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Tour;
use App\Support\Booking\BookingDocumentData;
use App\Support\Mail\AdminUrl;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * The office's copy of a new tour booking, laid out to be printed: an average
 * booking of two or three passengers fits on one page, with every passenger's
 * details in one table.
 */
class NewTourBookingOfficeNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Booking $booking,
        public readonly Tour $tour,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Új foglalás érkezett: {$this->tour->name}",
        );
    }

    public function content(): Content
    {
        $document = (new BookingDocumentData($this->booking, $this->tour))->toArray();

        return new Content(
            view: 'emails.bookings.new-office-notification',
            with: [
                ...$document,
                'adminUrl' => AdminUrl::to('/bookings/tour-bookings/'.$this->booking->id),
                'passengerTable' => $this->passengerTable($document['passengers']),
            ],
        );
    }

    /**
     * The passengers as one table: a column for every detail any of them gave,
     * in the booking form's order, and a row per passenger.
     *
     * @param  array<int, array<int, array{label: string, value: string}>>  $passengers
     * @return array{columns: array<int, string>, rows: array<int, array<string, string>>}
     */
    private function passengerTable(array $passengers): array
    {
        $rows = array_map(
            fn (array $details): array => array_column($details, 'value', 'label'),
            $passengers,
        );
        $columns = array_values(array_unique(array_merge([], ...array_map('array_keys', $rows))));

        return ['columns' => $columns, 'rows' => $rows];
    }
}
