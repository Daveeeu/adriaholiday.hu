<?php

namespace App\Services\Tour;

use App\Models\Tour;
use App\Support\PublicContentCache;
use Illuminate\Database\Eloquent\Builder;

/**
 * Keeps departed tours off the public site: an active tour whose every
 * scheduled date has departed is switched off (and marked expired_at), and a
 * tour switched off that way is switched back on once it gets an upcoming
 * date. Tours without any date (on request, e.g. school trips) and tours an
 * admin switched off are left alone.
 */
class ExpiredTourService
{
    /**
     * @return array{deactivated: array<int, string>, reactivated: array<int, string>}
     */
    public function sync(): array
    {
        $deactivated = Tour::query()
            ->where('active', true)
            ->whereHas('dates', fn (Builder $dates) => $dates->whereNotNull('start_date'))
            ->whereDoesntHave('dates', fn (Builder $dates) => $dates->upcoming())
            ->get()
            ->each(fn (Tour $tour) => $tour->forceFill(['active' => false, 'expired_at' => now()])->save());

        $reactivated = Tour::query()
            ->where('active', false)
            ->whereNotNull('expired_at')
            ->whereHas('dates', fn (Builder $dates) => $dates->whereNotNull('start_date')->upcoming())
            ->get()
            ->each(fn (Tour $tour) => $tour->forceFill(['active' => true, 'expired_at' => null])->save());

        if ($deactivated->isNotEmpty() || $reactivated->isNotEmpty()) {
            PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PORTFOLIO_FILTERS, PublicContentCache::PORTFOLIO_COUNTRIES, PublicContentCache::SITEMAP);
        }

        return [
            'deactivated' => $deactivated->pluck('seo_name')->all(),
            'reactivated' => $reactivated->pluck('seo_name')->all(),
        ];
    }
}
