<?php

namespace App\Services\Booking;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourProgramDay;
use App\Services\Tour\RouteMap\TourRouteMapService;
use App\Support\Booking\BookingDocumentData;
use App\Support\Booking\TourBookingStatus;
use App\Support\DocumentBranding;
use App\Support\RichTextSanitizer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

/**
 * The booking's travel book ("utazási könyv") PDF: everything the booking holds –
 * the trip, the contact, the price, how to pay, each passenger with the extras and
 * insurances they chose, the travel information – followed by the day-by-day
 * program, what the price includes and the trip page's further texts (entrance
 * fees, notes, optional programs…), all in one typography. The customer gets it with the booking confirmation;
 * the admin's copy also shows the booking status and the internal note.
 */
class BookingTravelBook
{
    public function __construct(private readonly TourRouteMapService $routeMaps) {}

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
            'programDays' => ($tour?->programDays ?? collect())->map(fn (TourProgramDay $day): array => [
                'number' => $day->day_number,
                'title' => $day->title && $day->title !== $day->day_number.'. nap' ? $day->title : null,
                'html' => RichTextSanitizer::tripText($day->description),
            ]),
            'programHtml' => RichTextSanitizer::tripText($tour?->program),
            'routeMap' => $tour ? $this->routeMaps->dataUri($tour) : null,
            'programFooterHtml' => RichTextSanitizer::tripText($tour?->program_footer),
            'includedItems' => $tour?->priceItems->where('type', 'included')->values() ?? collect(),
            'excludedItems' => $tour?->priceItems->where('type', 'excluded')->values() ?? collect(),
            'tripSections' => $tour ? $this->tripSections($tour) : [],
            'branding' => DocumentBranding::resolve(),
            'generatedAt' => now()->format('Y.m.d. H:i'),
        ])->render();
    }

    /**
     * The trip page's further texts, under its titles and in its order.
     *
     * @return list<array{title: string, html: string}>
     */
    private function tripSections(Tour $tour): array
    {
        $sections = [
            'Belépőjegyek' => RichTextSanitizer::tripText($tour->tickets),
            'Jegyzet / egyéb' => RichTextSanitizer::tripText($tour->notes, jsonAsNull: true),
            'Fakultatív programok' => RichTextSanitizer::tripText($tour->optional_programs),
            'Kiegészítő / fizető programok' => RichTextSanitizer::tripText($tour->payment_program),
            'További szolgáltatási információk' => RichTextSanitizer::tripText($tour->inclusions),
        ];

        return collect($sections)
            ->filter()
            ->map(fn (string $html, string $title): array => ['title' => $title, 'html' => $html])
            ->values()
            ->all();
    }

    /**
     * The customer's copy is named after the trip, as customers never see the
     * booking number; the office's copy carries it to tell bookings apart.
     */
    public function fileName(Booking $booking, bool $internal = false): string
    {
        $name = $booking->offer_code ?: ($internal ? (string) $booking->id : (string) $booking->offer_name_snapshot);

        return 'utazasi-konyv-'.(Str::slug($name) ?: 'foglalas').'.pdf';
    }
}
