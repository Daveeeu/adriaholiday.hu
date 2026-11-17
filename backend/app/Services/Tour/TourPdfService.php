<?php

namespace App\Services\Tour;

use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDeparturePlace;
use App\Models\TourProgramDay;
use App\Services\Tour\RouteMap\TourRouteMapService;
use App\Support\DocumentBranding;
use App\Support\HufPrice;
use App\Support\PriceBoxData;
use App\Support\RichTextSanitizer;
use App\Support\Tour\TourDateStatus;
use App\Support\TourMeta;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

/**
 * The branded program PDF of a tour, with everything the offer page shows
 * apart from the gallery and the booking form (route map, program days,
 * departure places, what the price includes and excludes, the tour's texts,
 * dates, transport, meals, accommodation, price), served to visitors from the
 * offer page and to admins from the tour list.
 */
class TourPdfService
{
    public function __construct(private readonly TourRouteMapService $routeMaps) {}

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
            'departurePlaces' => fn ($query) => $query->where('active', true),
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
            'meals' => TourMeta::meals($tour),
            'mealsInfo' => TourMeta::mealsInfo($tour),
            'accommodation' => TourMeta::accommodation($tour),
            'accommodationInfo' => TourMeta::accommodationInfo($tour),
            'departurePlaces' => $this->departurePlaces($tour),
            'displayedPrice' => $priceBox['displayedPrice'] ?? null,
            'generatedAt' => now()->format('Y.m.d. H:i'),
            'branding' => DocumentBranding::resolve(),
            'routeMap' => $this->routeMaps->dataUri($tour),
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
            'teaser' => $tour->teaser,
            'programBefore' => $tour->program_before,
            'program' => $tour->program,
            'programFooter' => $tour->program_footer,
            'tickets' => $tour->tickets,
            // The legacy import keeps its meta as JSON here; that is no note.
            'notes' => is_array(json_decode(trim((string) $tour->notes), true)) ? null : $tour->notes,
            'optionalPrograms' => $tour->optional_programs,
            'paymentProgram' => $tour->payment_program,
            'inclusions' => $tour->inclusions,
            'prices' => $tour->prices,
            'discounts' => $tour->discounts,
        ];

        return array_map(fn (?string $html): ?string => RichTextSanitizer::sanitizeUniform($html) ?: null, $fields);
    }

    /**
     * The tour's active departure places in the bus's order, each with its
     * fee per person ("+4.700 Ft/fő") when it has one.
     *
     * @return list<array{name: string, fee: ?string}>
     */
    private function departurePlaces(Tour $tour): array
    {
        $currency = $tour->price_box_currency ?: 'HUF';

        return $tour->departurePlaces
            ->map(function (TourDeparturePlace $place) use ($currency): array {
                $fee = $place->tourFee();

                return [
                    'name' => (string) $place->name,
                    'fee' => $fee > 0 ? '+'.($currency === 'EUR' ? HufPrice::amount($fee).' EUR' : HufPrice::format($fee)).'/fő' : null,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Every upcoming, not cancelled departure with its price and note, in
     * the order the office set.
     *
     * @return list<array{label: string, price: ?string, originalPrice: ?string, note: ?string, soldOut: bool}>
     */
    private function dates(Tour $tour): array
    {
        return $tour->dates
            ->reject(fn (TourDate $date) => $date->status === TourDateStatus::CANCELLED)
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
