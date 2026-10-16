<?php

namespace App\Http\Resources;

use App\Models\Location;
use App\Support\Apartment\ApartmentLayout;
use App\Support\Apartment\ApartmentServiceCatalog;
use App\Support\RichTextSanitizer;
use App\Support\Seo\RobotsDirective;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A location's apartment page on the public site: its texts and the search
 * filters its apartment list offers.
 *
 * @mixin Location
 */
class PortfolioApartmentLocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'areaSlug' => $this->area_slug,
            'areaName' => $this->area_name,
            'regionName' => $this->region?->name,
            'link' => $this->apartmentPagePath(),
            'description' => RichTextSanitizer::sanitize($this->description) ?: null,
            'guide' => RichTextSanitizer::sanitize($this->guide) ?: null,
            'seoTitle' => $this->seo_title,
            'seoDescription' => $this->seo_description,
            'robots' => RobotsDirective::restrictive($this->seo_robots),
            'filters' => [
                'layouts' => ApartmentLayout::options(),
                'services' => ApartmentServiceCatalog::filters(),
                'stars' => [1, 2, 3, 4, 5],
            ],
        ];
    }
}
