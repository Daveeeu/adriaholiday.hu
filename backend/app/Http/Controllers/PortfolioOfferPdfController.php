<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use App\Support\DocumentBranding;
use App\Support\PriceBoxData;
use App\Support\TourMeta;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class PortfolioOfferPdfController extends Controller
{
    public function __invoke(string $slug): Response
    {
        $tour = Tour::query()
            ->where('active', true)
            ->where('seo_name', $slug)
            ->with([
                'programDays' => fn ($query) => $query->where('active', true)->orderBy('sort_order'),
                'priceItems' => fn ($query) => $query->where('active', true)->orderBy('sort_order'),
                'dates',
            ])
            ->firstOrFail();

        $meta = TourMeta::extract($tour);
        $priceBox = PriceBoxData::fromTour($tour);
        $firstDate = $tour->dates->sortBy('start_date')->first();

        $departureLabel = $meta['departureDateLabel'] ?? (
            $firstDate?->start_date && $firstDate?->end_date
                ? $firstDate->start_date->format('Y.m.d.').' - '.$firstDate->end_date->format('d.')
                : 'Érdeklődjön'
        );

        $pdf = Pdf::loadView('pdf.tour-program', [
            'tour' => $tour,
            'programDays' => $tour->programDays,
            'includedItems' => $tour->priceItems->where('type', 'included')->values(),
            'excludedItems' => $tour->priceItems->where('type', 'excluded')->values(),
            'duration' => $meta['duration'] ?? 'Többnapos út',
            'departureLabel' => $departureLabel,
            'transportLabel' => TourMeta::transportLabel($tour) ?? 'Érdeklődjön',
            'displayedPrice' => $priceBox['displayedPrice'] ?? null,
            'generatedAt' => now()->format('Y.m.d. H:i'),
            'branding' => DocumentBranding::resolve(),
        ]);

        $filename = Str::slug($tour->seo_name ?: $tour->name).'-program.pdf';

        return $pdf->download($filename);
    }
}
