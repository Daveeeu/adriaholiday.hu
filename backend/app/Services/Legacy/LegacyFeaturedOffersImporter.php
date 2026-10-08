<?php

namespace App\Services\Legacy;

use App\Models\Tour;
use App\Support\PublicContentCache;
use Illuminate\Support\Facades\DB;

/**
 * Makes the new site's featured offers the legacy homepage's "Kiemelt
 * Ajánlataink!": the listed tours become featured in the listed order, every
 * other tour stops being featured.
 */
class LegacyFeaturedOffersImporter
{
    /**
     * @param  array<int, string>  $slugs  legacy offer slugs in homepage order
     * @return array{featured: array<int, string>, missing: array<int, string>}
     */
    public function import(array $slugs): array
    {
        $tours = Tour::query()->whereIn('seo_name', $slugs)->get()->keyBy('seo_name');
        $featured = array_values(array_filter($slugs, fn (string $slug): bool => $tours->has($slug)));

        DB::transaction(function () use ($tours, $featured): void {
            Tour::query()
                ->where('featured', true)
                ->whereNotIn('id', $tours->pluck('id'))
                ->get()
                ->each(fn (Tour $tour) => $tour->update(['featured' => false, 'featured_order' => null]));

            foreach ($featured as $index => $slug) {
                $tours[$slug]->update(['featured' => true, 'featured_order' => $index + 1]);
            }
        });

        PublicContentCache::bump(PublicContentCache::OFFERS);

        return [
            'featured' => $featured,
            'missing' => array_values(array_diff($slugs, $featured)),
        ];
    }
}
