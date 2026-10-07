<?php

namespace App\Http\Resources;

use App\Models\Tour;
use App\Services\Booking\BookingFormFieldResolver;
use App\Services\Booking\BookingPaymentService;
use App\Support\Booking\BookingInsuranceSettings;
use App\Support\RichTextSanitizer;
use App\Support\TourMeta;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PortfolioOfferDetailResource extends TourDetailResource
{
    public function toArray(Request $request): array
    {
        $tour = $this->resource;
        $meta = TourMeta::extract($tour);
        $media = $tour->mainImage();
        $firstDate = $tour->dates->sortBy('start_date')->first();
        $priceItems = $tour->priceItems->where('active', true)->sortBy('sort_order')->values();
        $departureDateLabel = $meta['departureDateLabel'] ?? null;

        if ($departureDateLabel === null) {
            $departureDateLabel = $firstDate?->start_date && $firstDate?->end_date
                ? $firstDate->start_date->format('Y.m.d.').' - '.$firstDate->end_date->format('d.')
                : 'Érdeklődjön';
        }

        $data = parent::toArray($request);
        unset($data['inclusions'], $data['bookingFormTemplateId'], $data['bookingFormTemplate']);

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

            $sanitized = RichTextSanitizer::sanitize($trimmed);

            return $sanitized !== '' ? $sanitized : null;
        };

        return array_merge($data, [
            'image' => $media ? new MediaResource($media) : null,
            'sliderImage' => $media ? new MediaResource($media) : null,
            'badge' => $meta['badge'] ?? null,
            'transport' => $meta['transport'] ?? null,
            'accommodation' => $meta['accommodation'] ?? null,
            'meals' => $meta['meals'] ?? null,
            'country' => $meta['country'] ?? $tour->region?->name,
            'duration' => $meta['duration'] ?? null,
            'seatsLeft' => isset($meta['seatsLeft']) ? (int) $meta['seatsLeft'] : null,
            'additionalDates' => (bool) ($meta['additionalDates'] ?? ($tour->dates->count() > 1)),
            'programBefore' => $sanitizeContent($tour->program_before),
            'program' => $sanitizeContent($tour->program),
            'inclusions' => $sanitizeContent($tour->inclusions),
            'paymentProgram' => $sanitizeContent($tour->payment_program),
            'prices' => $sanitizeContent($tour->prices),
            'discounts' => $sanitizeContent($tour->discounts),
            'notes' => $sanitizeContent($tour->notes, true),
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
            'departureDateLabel' => $departureDateLabel,
            'link' => '/ajanlat/'.($tour->seo_name ?: Str::slug((string) $tour->name)),
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
        $days = TourProgramDayResource::collection($tour->programDays ?? [])->resolve($request);
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
