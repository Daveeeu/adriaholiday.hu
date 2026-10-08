<?php

namespace App\Http\Resources;

use App\Models\Tour;
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
            'departureDateLabel' => TourMeta::departureLabel($tour),
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
            'categories' => TourLabelResolver::blogCategoryItems($tour->category_ids ?? []),
            'discountBadge' => $this->discountBadge($tour, $priceBox),
        ];
    }

    /**
     * The tour's promotion, from its earliest discounted date: a percentage
     * badge, or the label of a struck-through price ("Előfoglalási akció").
     */
    private function discountBadge(Tour $tour, ?array $priceBox): ?string
    {
        $date = $tour->dates
            ->sortBy('start_date')
            ->first(fn ($date): bool => filled($date->price_box_discount_badge) || ($date->price_box_original_price !== null && (float) $date->price_box_original_price > (float) $date->price));

        if ($date === null) {
            return $priceBox['discountBadge'] ?? null;
        }

        return $date->price_box_discount_badge ?: ($date->price_box_label ?: 'Akció');
    }
}
