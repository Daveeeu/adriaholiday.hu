<?php

namespace App\Http\Resources;

use App\Models\Tour;
use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PortfolioOfferDetailResource extends TourDetailResource
{
    private function meta(Tour $tour): array
    {
        $notes = trim((string) $tour->notes);

        if ($notes === '') {
            return [];
        }

        $decoded = json_decode($notes, true);

        return is_array($decoded) ? $decoded : [];
    }

    public function toArray(Request $request): array
    {
        $tour = $this->resource;
        $meta = $this->meta($tour);
        $media = $tour->getFirstMedia('slider');
        $firstDate = $tour->dates->sortBy('start_date')->first();
        $priceItems = $tour->priceItems->where('active', true)->sortBy('sort_order')->values();
        $departureDateLabel = $meta['departureDateLabel'] ?? null;

        if ($departureDateLabel === null) {
            $departureDateLabel = $firstDate?->start_date && $firstDate?->end_date
                ? $firstDate->start_date->format('Y.m.d.').' - '.$firstDate->end_date->format('d.')
                : 'Érdeklődjön';
        }

        $data = parent::toArray($request);
        unset($data['inclusions']);

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
            'programDays' => TourProgramDayResource::collection($tour->programDays ?? [])->resolve($request),
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
        ]);
    }
}
