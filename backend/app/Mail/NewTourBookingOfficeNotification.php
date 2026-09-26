<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\BookingFormField;
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
    ) {}

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
                'extras' => $this->extraSelections(),
            ],
        );
    }

    /**
     * Values the customer gave on the final "extra options" step; the note
     * is excluded because the template shows it in its own section.
     *
     * @return array<int, array{label: string, value: string}>
     */
    private function extraSelections(): array
    {
        $formData = $this->booking->payload['formData'] ?? [];

        return BookingFormField::query()
            ->where('input_group', BookingFormField::EXTRA_GROUP)
            ->whereIn('key', array_keys($formData))
            ->where('key', '!=', 'note')
            ->orderBy('sort_order')
            ->get(['key', 'label'])
            ->map(fn (BookingFormField $field): array => [
                'label' => $field->label,
                'value' => (string) $formData[$field->key],
            ])
            ->all();
    }
}
