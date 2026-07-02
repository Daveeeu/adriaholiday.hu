<?php

namespace App\Http\Resources;

use App\Models\Tour;
use App\Support\PriceBoxData;
use App\Support\TourLabelResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class PortfolioFeaturedTourResource extends JsonResource
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

    private function formattedDuration(?string $startDate, ?string $endDate, ?string $fallback = null): ?string
    {
        if ($startDate === null || $endDate === null) {
            return $fallback;
        }

        try {
            $start = \Carbon\Carbon::parse($startDate);
            $end = \Carbon\Carbon::parse($endDate);
        } catch (\Throwable) {
            return $fallback;
        }

        $days = max(1, $start->diffInDays($end) + 1);
        $nights = max(0, $days - 1);

        return "{$days} nap / {$nights} éj";
    }

    public function toArray(Request $request): array
    {
        $tour = $this->resource;
        $meta = $this->meta($tour);
        $priceBox = PriceBoxData::fromTour($tour);
        $firstDate = $tour->dates->sortBy('start_date')->first();
        $media = $tour->getFirstMedia('slider');
        $departureDate = $firstDate?->start_date?->toDateString();
        $duration = $this->formattedDuration(
            $firstDate?->start_date?->toDateString(),
            $firstDate?->end_date?->toDateString(),
            $meta['duration'] ?? null,
        );
        $displayedPrice = $priceBox['displayedPrice'] ?? null;
        $departureDateLabel = $meta['departureDateLabel'] ?? null;
        if ($departureDateLabel === null) {
            $departureDateLabel = $firstDate?->start_date && $firstDate?->end_date
                ? $firstDate->start_date->format('Y.m.d.').' - '.$firstDate->end_date->format('d.')
                : 'Érdeklődjön';
        }

        return [
            'id' => $tour->id,
            'name' => (string) $tour->name,
            'seoName' => (string) ($tour->seo_name ?: Str::slug((string) $tour->name)),
            'sortOrder' => (int) $tour->sort_order,
            'active' => (bool) $tour->active,
            'featured' => (bool) $tour->featured,
            'shortDescription' => (string) ($tour->short_description ?? ''),
            'listDescription' => (string) ($tour->list_description ?? ''),
            'price' => $priceBox['price'] ?? ($tour->price !== null ? (float) $tour->price : null),
            'displayedPrice' => $displayedPrice,
            'image' => $media ? new MediaResource($media) : null,
            'duration' => $duration,
            'departureDate' => $departureDate,
            'departureDateLabel' => $departureDateLabel,
            'link' => '/ajanlat/'.($tour->seo_name ?: Str::slug((string) $tour->name)),
            'badge' => $meta['badge'] ?? null,
            'transport' => $meta['transport'] ?? null,
            'programTypeLabel' => TourLabelResolver::referenceOptionLabel('program-type', $tour->program_type_id),
            'accommodation' => $meta['accommodation'] ?? null,
            'meals' => $meta['meals'] ?? null,
            'seatsLeft' => isset($meta['seatsLeft']) ? (int) $meta['seatsLeft'] : null,
            'additionalDates' => (bool) ($meta['additionalDates'] ?? ($tour->dates->count() > 1)),
            'departureDateCount' => (int) $tour->dates->count(),
            'country' => $meta['country'] ?? $tour->region?->name,
        ];
    }
}
