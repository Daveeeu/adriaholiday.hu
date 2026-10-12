<?php

namespace App\Services\Booking;

use App\Models\Booking;
use App\Support\Booking\BookingDocumentData;
use App\Support\Booking\TourBookingStatus;
use App\Support\DocumentBranding;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

/**
 * The booking's travel book ("utazási könyv") PDF: everything the booking holds –
 * the trip, the contact, each passenger with the extras and insurances they chose,
 * the price, how to pay – followed by the day-by-day program, what the price
 * includes and the trip notes. The customer gets it with the booking confirmation;
 * the admin's copy also shows the booking status and the internal note.
 */
class BookingTravelBook
{
    public function pdf(Booking $booking, bool $internal = false): string
    {
        return Pdf::loadHTML($this->html($booking, $internal))->output();
    }

    public function html(Booking $booking, bool $internal = false): string
    {
        $booking->loadMissing('tourDate');
        $tour = $booking->tour?->load([
            'programDays' => fn ($query) => $query->where('active', true)->orderBy('sort_order'),
            'priceItems' => fn ($query) => $query->where('active', true)->orderBy('sort_order'),
        ]);

        return view('pdf.booking', [
            ...(new BookingDocumentData($booking, $tour))->toArray(),
            'internal' => $internal,
            'statusLabel' => TourBookingStatus::label((string) $booking->status),
            'programDays' => $tour?->programDays ?? collect(),
            'includedItems' => $tour?->priceItems->where('type', 'included')->values() ?? collect(),
            'excludedItems' => $tour?->priceItems->where('type', 'excluded')->values() ?? collect(),
            'tripNotes' => $tour?->notes,
            'branding' => DocumentBranding::resolve(),
            'generatedAt' => now()->format('Y.m.d. H:i'),
        ])->render();
    }

    public function fileName(Booking $booking): string
    {
        return 'utazasi-konyv-'.Str::slug($booking->offer_code ?: (string) $booking->id).'.pdf';
    }
}
