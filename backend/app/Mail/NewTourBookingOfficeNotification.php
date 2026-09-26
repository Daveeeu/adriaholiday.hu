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
                'pricingLines' => $this->pricingLines(),
                'pricingTotal' => $this->pricingTotal(),
            ],
        );
    }

    /**
     * Human-readable lines of the server-calculated price breakdown.
     *
     * @return array<int, string>
     */
    private function pricingLines(): array
    {
        $pricing = $this->booking->payload['pricing'] ?? null;

        if (! is_array($pricing)) {
            return [];
        }

        $lines = [];

        if ($pricing['basePrice'] !== null) {
            $lines[] = sprintf('Részvételi díj: %d fő × %s = %s', $pricing['passengers'], $this->formatPrice($pricing['basePrice']), $this->formatPrice($pricing['baseTotal']));
        }

        if ($pricing['departurePlace'] !== null) {
            $place = $pricing['departurePlace'];
            $lines[] = $place['total'] > 0
                ? sprintf('Felszállás: %s – %s', $place['name'], $this->formatPrice($place['total']))
                : sprintf('Felszállás: %s', $place['name']);
        }

        foreach ($pricing['extras'] as $extra) {
            $lines[] = sprintf(
                '%s%s: %d × %s = %s',
                $extra['name'],
                $extra['mandatory'] ? ' (kötelező)' : '',
                $extra['quantity'],
                $this->formatPrice($extra['price']),
                $this->formatPrice($extra['total']),
            );
        }

        return $lines;
    }

    private function pricingTotal(): ?string
    {
        $total = $this->booking->payload['pricing']['total'] ?? null;

        return $total !== null ? $this->formatPrice((float) $total) : null;
    }

    private function formatPrice(float $amount): string
    {
        $currency = strtoupper((string) ($this->booking->payload['pricing']['currency'] ?? 'HUF'));

        return number_format($amount, 0, ',', '.').' '.($currency === 'HUF' ? 'Ft' : $currency);
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
