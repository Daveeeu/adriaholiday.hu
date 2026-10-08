<?php

namespace App\Services\Tour;

use App\Models\Tour;
use App\Support\DocumentBranding;
use App\Support\PriceBoxData;
use App\Support\TourMeta;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

/**
 * The branded program PDF of a tour (program days, what the price includes and
 * excludes, dates, transport, price), served to visitors from the offer page and
 * to admins from the tour list.
 */
class TourPdfService
{
    public function download(Tour $tour): Response
    {
        $tour->load([
            'programDays' => fn ($query) => $query->where('active', true)->orderBy('sort_order'),
            'priceItems' => fn ($query) => $query->where('active', true)->orderBy('sort_order'),
            'dates' => fn ($query) => $query->upcoming(),
        ]);

        $priceBox = PriceBoxData::fromTour($tour);

        $pdf = Pdf::loadView('pdf.tour-program', [
            'tour' => $tour,
            'programDays' => $tour->programDays,
            'includedItems' => $tour->priceItems->where('type', 'included')->values(),
            'excludedItems' => $tour->priceItems->where('type', 'excluded')->values(),
            'duration' => TourMeta::duration($tour) ?? 'Többnapos út',
            'departureLabel' => TourMeta::departureLabel($tour),
            'transportLabel' => TourMeta::transportLabel($tour) ?? TourMeta::INQUIRE_LABEL,
            'displayedPrice' => $priceBox['displayedPrice'] ?? null,
            'generatedAt' => now()->format('Y.m.d. H:i'),
            'branding' => DocumentBranding::resolve(),
        ]);

        return $pdf->download(Str::slug($tour->seo_name ?: $tour->name).'-program.pdf');
    }
}
