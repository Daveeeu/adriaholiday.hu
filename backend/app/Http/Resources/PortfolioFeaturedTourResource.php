<?php

namespace App\Http\Resources;

use App\Support\PriceBoxData;
use App\Support\TourLabelResolver;
use App\Support\TourMeta;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class PortfolioFeaturedTourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $tour = $this->resource;
        $meta = TourMeta::extract($tour);
        $priceBox = PriceBoxData::fromTour($tour);
        $firstDate = $tour->dates->sortBy('start_date')->first();
        $media = $tour->mainImage();
        $departureDate = $firstDate?->start_date?->toDateString();
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
            'duration' => TourMeta::duration($tour),
            'departureDate' => $departureDate,
            'departureDateLabel' => $departureDateLabel,
            'link' => '/ajanlat/'.($tour->seo_name ?: Str::slug((string) $tour->name)),
            'badge' => $meta['badge'] ?? null,
            'transport' => TourMeta::transport($tour),
            'programTypeLabel' => TourLabelResolver::referenceOptionLabel('program-type', $tour->program_type_id),
            'accommodation' => TourMeta::accommodation($tour),
            'meals' => TourMeta::meals($tour),
            'seatsLeft' => isset($meta['seatsLeft']) ? (int) $meta['seatsLeft'] : null,
            'additionalDates' => (bool) ($meta['additionalDates'] ?? ($tour->dates->count() > 1)),
            'departureDateCount' => (int) $tour->dates->count(),
            'country' => TourMeta::country($tour),
        ];
    }
}
