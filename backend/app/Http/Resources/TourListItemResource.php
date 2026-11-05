<?php

namespace App\Http\Resources;

use App\Models\Tour;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A tour as the list order editor shows it; `placed` tells whether the
 * office placed it on the list or it follows the global order.
 *
 * @mixin Tour
 */
class TourListItemResource extends JsonResource
{
    /**
     * @param  array<int, int>  $placedTourIds
     */
    public function __construct(Tour $tour, private readonly array $placedTourIds = [])
    {
        parent::__construct($tour);
    }

    public function toArray(Request $request): array
    {
        $media = $this->mainImage();

        return [
            'id' => (string) $this->id,
            'name' => (string) $this->name,
            'price' => $this->price !== null ? (float) $this->price : null,
            'thumbnailUrl' => $media?->hasGeneratedConversion('thumbnail') ? $media->getUrl('thumbnail') : $media?->getUrl(),
            'link' => $this->publicPath(),
            'placed' => in_array($this->id, $this->placedTourIds, true),
        ];
    }
}
