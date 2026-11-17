<?php

namespace App\Http\Resources;

use App\Models\Tour;
use App\Models\TourDate;
use App\Services\Booking\BookingFormFieldResolver;
use App\Services\Booking\BookingPaymentService;
use App\Services\Tour\RouteMap\TourRouteMapService;
use App\Support\Booking\BookingInsuranceSettings;
use App\Support\RichTextSanitizer;
use App\Support\Seo\RobotsDirective;
use App\Support\Tour\TourRouteStops;
use App\Support\TourMeta;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class PortfolioOfferDetailResource extends TourDetailResource
{
    public function toArray(Request $request): array
    {
        $tour = $this->resource;
        $meta = TourMeta::extract($tour);
        $media = $tour->mainImage();
        $firstDate = $tour->dates->sortBy('start_date')->first();
        $priceItems = $tour->priceItems->where('active', true)->sortBy('sort_order')->values();

        $data = parent::toArray($request);
        unset($data['inclusions'], $data['bookingFormTemplateId'], $data['bookingFormTemplate'], $data['partnerXml'], $data['routeStops']);
        $routeMapUrl = app(TourRouteMapService::class)->url($tour);

        $sanitizeContent = function (?string $value, bool $jsonAsNull = false): ?string {
            $trimmed = trim((string) $value);

            if ($trimmed === '') {
                return null;
            }

            if ($jsonAsNull) {
                $decoded = json_decode($trimmed, true);

                if (is_array($decoded)) {
                    return null;
                }
            }

            $sanitized = RichTextSanitizer::sanitizeUniform($trimmed);

            return $sanitized !== '' ? $sanitized : null;
        };

        // A date's own stay, shown as the tour's is (null: the tour's); a
        // date with no seat left is sold out. Only the free seats are public,
        // and whether they are running low, not the capacity.
        $data['dates'] = array_map(fn (array $date, TourDate $model): array => [
            ...Arr::except($date, ['xmlEnabled', 'partnerXml', 'capacity', 'seatsHeld']),
            'status' => $model->effectiveStatus(),
            'seatsRunningLow' => $model->seatsRunningLow(),
            'accommodation' => TourMeta::accommodationLabel($date['accommodation'] ?? null),
            'catering' => TourMeta::mealsLabel($date['catering'] ?? null),
        ], $data['dates'] ?? [], $tour->dates->values()->all());

        return array_merge($data, [
            'image' => $media ? new MediaResource($media) : null,
            'sliderImage' => $media ? new MediaResource($media) : null,
            'badge' => $meta['badge'] ?? null,
            'transport' => TourMeta::transport($tour),
            'accommodation' => TourMeta::accommodation($tour),
            'accommodationInfo' => TourMeta::accommodationInfo($tour),
            'meals' => TourMeta::meals($tour),
            'mealsInfo' => TourMeta::mealsInfo($tour),
            'country' => TourMeta::country($tour),
            'duration' => TourMeta::duration($tour),
            'additionalDates' => (bool) ($meta['additionalDates'] ?? ($tour->dates->count() > 1)),
            'programBefore' => $sanitizeContent($tour->program_before),
            'program' => $sanitizeContent($tour->program),
            'programFooter' => $sanitizeContent($tour->program_footer),
            'routeMap' => $routeMapUrl !== null ? [
                'url' => $routeMapUrl,
                'alt' => 'Az utazás útvonala: '.implode(' – ', array_column(TourRouteStops::normalize($tour->route_stops), 'name')),
            ] : null,
            'robots' => RobotsDirective::restrictive($tour->seo_robots),
            'inclusions' => $sanitizeContent($tour->inclusions),
            'paymentProgram' => $sanitizeContent($tour->payment_program),
            'teaser' => $sanitizeContent($tour->teaser),
            'searchKeywords' => $tour->search_keywords ?? [],
            'tickets' => $sanitizeContent($tour->tickets),
            'optionalPrograms' => $sanitizeContent($tour->optional_programs),
            'prices' => $sanitizeContent($tour->prices),
            'discounts' => $sanitizeContent($tour->discounts),
            'notes' => $sanitizeContent($tour->notes, true),
            'gallery' => TourGalleryItemResource::collection(
                $tour->galleryItems->where('active', true)->whereNotNull('media')->sortBy('sort_order')->values(),
            )->resolve($request),
            'programDays' => $this->programDays($tour, $request),
            'priceInformation' => [
                'included' => $priceItems
                    ->where('type', 'included')
                    ->values()
                    ->map(fn ($item): array => [
                        'id' => (string) $item->id,
                        'text' => (string) $item->text,
                    ])
                    ->all(),
                'excluded' => $priceItems
                    ->where('type', 'excluded')
                    ->values()
                    ->map(fn ($item): array => [
                        'id' => (string) $item->id,
                        'text' => (string) $item->text,
                    ])
                    ->all(),
            ],
            'departureDate' => $firstDate?->start_date?->toDateString(),
            'departureDateLabel' => TourMeta::departureLabel($tour),
            'link' => $tour->publicPath(),
            'bookingFormFields' => app(BookingFormFieldResolver::class)->resolve($tour),
            'bookingInsurances' => BookingInsuranceSettings::load()->toArray(),
            'bookingPayment' => app(BookingPaymentService::class)->publicOptions($tour->price_box_currency ?: 'HUF'),
        ]);
    }

    /**
     * Days without their own image get one of the tour's gallery images, in
     * turn, so neighbouring days show different pictures of the trip.
     *
     * @return list<array<string, mixed>>
     */
    private function programDays(Tour $tour, Request $request): array
    {
        $days = array_map(
            fn (array $day): array => [...$day, 'description' => RichTextSanitizer::sanitizeUniform($day['description'] ?? null)],
            TourProgramDayResource::collection($tour->programDays ?? [])->resolve($request),
        );
        $fallbackImages = $tour->programDayFallbackImageUrls();

        if ($fallbackImages === []) {
            return $days;
        }

        $position = 0;

        return array_map(function (array $day) use ($fallbackImages, &$position): array {
            if (! $day['active']) {
                return $day;
            }

            $day['image'] ??= $fallbackImages[$position % count($fallbackImages)];
            $position++;

            return $day;
        }, $days);
    }
}
