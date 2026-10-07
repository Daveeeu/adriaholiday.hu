<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use App\Services\Tour\TourPdfService;
use Illuminate\Http\Response;

class PortfolioOfferPdfController extends Controller
{
    public function __invoke(string $slug, TourPdfService $pdf): Response
    {
        $tour = Tour::query()
            ->where('active', true)
            ->where('seo_name', $slug)
            ->firstOrFail();

        return $pdf->download($tour);
    }
}
