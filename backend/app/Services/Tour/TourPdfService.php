<?php

namespace App\Services\Tour;

use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourProgramDay;
use App\Support\DocumentBranding;
use App\Support\PriceBoxData;
use App\Support\RichTextSanitizer;
use App\Support\Tour\TourDateStatus;
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
        return Pdf::loadHTML($this->html($tour))->download(Str::slug($tour->seo_name ?: $tour->name).'-program.pdf');
    }

    /**
     * The program document's HTML, rendered into the PDF.
     */
    public function html(Tour $tour): string
    {
        $tour->load([
            'programDays' => fn ($query) => $query->where('active', true)->orderBy('sort_order'),
            'priceItems' => fn ($query) => $query->where('active', true)->orderBy('sort_order'),
            'dates' => fn ($query) => $query->upcoming(),
        ]);

        $priceBox = PriceBoxData::fromTour($tour);

        return view('pdf.tour-program', [
            'tour' => $tour,
            'programDays' => $tour->programDays,
            'content' => $this->content($tour),
            'dayDescriptions' => $tour->programDays
                ->mapWithKeys(fn (TourProgramDay $day) => [$day->id => RichTextSanitizer::sanitizeUniform($day->description) ?: null])
                ->all(),
            'dates' => $this->dates($tour),
            'includedItems' => $tour->priceItems->where('type', 'included')->values(),
            'excludedItems' => $tour->priceItems->where('type', 'excluded')->values(),
            'duration' => TourMeta::duration($tour) ?? 'Többnapos út',
            'departureLabel' => TourMeta::departureLabel($tour),
            'transportLabel' => TourMeta::transportLabel($tour) ?? TourMeta::INQUIRE_LABEL,
            'displayedPrice' => $priceBox['displayedPrice'] ?? null,
            'generatedAt' => now()->format('Y.m.d. H:i'),
            'branding' => DocumentBranding::resolve(),
        ])->render();
    }

    /**
     * The tour's texts in the site's own typography: inline fonts the PDF
     * font lacks (printing "?" for "ő") and per-trip sizes and colours dropped.
     *
     * @return array<string, string|null>
     */
    private function content(Tour $tour): array
    {
        $fields = [
            'shortDescription' => $tour->short_description,
            'programBefore' => $tour->program_before,
            'program' => $tour->program,
            'programFooter' => $tour->program_footer,
            'paymentProgram' => $tour->payment_program,
            'prices' => $tour->prices,
            'discounts' => $tour->discounts,
        ];

        return array_map(fn (?string $html): ?string => RichTextSanitizer::sanitizeUniform($html) ?: null, $fields);
    }

    /**
     * Every upcoming, not cancelled departure with its price and note.
     *
     * @return list<array{label: string, price: ?string, originalPrice: ?string, note: ?string, soldOut: bool}>
     */
    private function dates(Tour $tour): array
    {
        return $tour->dates
            ->reject(fn (TourDate $date) => $date->status === TourDateStatus::CANCELLED)
            ->sortBy('start_date')
            ->map(function (TourDate $date): array {
                $priceBox = PriceBoxData::fromDate($date);

                return [
                    'label' => TourMeta::dateRangeLabel($date),
                    'price' => $priceBox['displayedPrice'] ?? null,
                    'originalPrice' => $priceBox['originalDisplayedPrice'] ?? null,
                    'note' => $priceBox['label'] ?? null,
                    'soldOut' => $date->status === TourDateStatus::SOLD_OUT,
                ];
            })
            ->values()
            ->all();
    }
}
