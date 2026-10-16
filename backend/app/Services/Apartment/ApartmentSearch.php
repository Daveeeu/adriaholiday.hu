<?php

namespace App\Services\Apartment;

use App\Models\Apartment;
use App\Models\Location;
use App\Support\Apartment\ApartmentLayout;
use App\Support\Apartment\ApartmentPriceTable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * The public apartments of a location, filtered by the location page's
 * search, in the legacy lists' order (by code).
 */
final class ApartmentSearch
{
    private const PER_PAGE = 12;

    /**
     * @param  array{code?: string|null, guests?: int|string|null, layouts?: list<string>|null, stars?: list<int|string>|null, services?: list<string>|null, page?: int|string|null, per_page?: int|string|null}  $filters
     * @return LengthAwarePaginator<int, Apartment>
     */
    public function search(Location $location, array $filters): LengthAwarePaginator
    {
        $query = Apartment::query()
            ->publiclyVisible()
            ->where('location_id', $location->id)
            ->with(['galleryItems' => fn ($items) => $items->where('active', true)->with('media')]);

        $this->applyColumnFilters($query, $filters);

        $layouts = array_values(array_filter($filters['layouts'] ?? []));

        // A layout is part of the apartment types' names in the price table, so it is matched here.
        $apartments = $query->get()
            ->when($layouts !== [], fn ($apartments) => $apartments->filter(
                fn (Apartment $apartment): bool => array_intersect($layouts, ApartmentLayout::ofCategories(ApartmentPriceTable::categories($apartment->pricing_matrix))) !== [],
            ))
            ->sortBy(fn (Apartment $apartment): string => sprintf('%08d|%s', (int) $apartment->code, $apartment->name))
            ->values();

        $perPage = (int) ($filters['per_page'] ?? self::PER_PAGE) ?: self::PER_PAGE;
        $page = max(1, (int) ($filters['page'] ?? 1));

        return new LengthAwarePaginator($apartments->forPage($page, $perPage)->values(), $apartments->count(), $perPage, $page);
    }

    /**
     * Public apartments to show off (on the home page): the featured ones
     * first, then the best categorised; only ones with a picture.
     *
     * @return Collection<int, Apartment>
     */
    public function highlighted(int $limit): Collection
    {
        return Apartment::query()
            ->publiclyVisible()
            ->whereHas('location', fn (Builder $locations) => $locations->withApartmentPage())
            ->whereHas('galleryItems', fn (Builder $items) => $items->where('active', true))
            ->with(['galleryItems' => fn ($items) => $items->where('active', true)->with('media')])
            ->orderByDesc('featured')
            ->orderByDesc('stars')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->limit($limit)
            ->get();
    }

    /**
     * @param  Builder<Apartment>  $query
     * @param  array<string, mixed>  $filters
     */
    private function applyColumnFilters(Builder $query, array $filters): void
    {
        $code = trim((string) ($filters['code'] ?? ''));

        if ($code !== '') {
            $query->where(fn (Builder $codes) => $codes->where('code', $code)->orWhere('code', 'like', "{$code}-%"));
        }

        if (($guests = (int) ($filters['guests'] ?? 0)) > 0) {
            $query->where('max_guests', '>=', $guests);
        }

        $stars = array_map('intval', $filters['stars'] ?? []);

        if ($stars !== []) {
            $query->whereIn('stars', $stars);
        }

        foreach (array_values(array_filter($filters['services'] ?? [])) as $service) {
            $query->whereJsonContains('services', $service);
        }
    }
}
