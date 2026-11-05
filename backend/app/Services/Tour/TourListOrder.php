<?php

namespace App\Services\Tour;

use App\Models\BlogCategory;
use App\Models\HomepageOffer;
use App\Models\Tour;
use App\Models\TourListPosition;
use App\Models\TourReferenceOption;
use App\Support\PortfolioOfferQuery;
use App\Support\PublicContentCache;
use App\Support\Tour\TourList;
use Collator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * The office's own order of the tours on a public list: the category page a
 * homepage tile leads to, or the offers page filtered to one country. A list
 * nobody ordered (and every tour not placed on it yet) follows the global
 * tour order.
 */
class TourListOrder
{
    private const CATEGORY_PATH_PREFIX = '/kategoriak/';

    /**
     * The homepage tiles that lead to a category page, in their homepage order.
     *
     * @return array<int, array{type: string, key: string, label: string, categoryName: string, tourCount: int, ordered: bool}>
     */
    public function tileLists(): array
    {
        $tiles = HomepageOffer::query()
            ->with('translations')
            ->where('active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $lists = [];

        foreach ($tiles as $tile) {
            $slug = $this->categorySlugFromTileLink((string) $tile->link);
            $category = $slug !== null ? PortfolioOfferQuery::resolveCategory($slug) : null;

            if ($category === null || isset($lists[$category->id])) {
                continue;
            }

            $translation = $tile->translations->firstWhere('locale', 'hu') ?? $tile->translations->first();
            $list = TourList::category($category->id);

            $lists[$category->id] = [
                'type' => $list->type,
                'key' => $list->key,
                'label' => (string) ($translation?->name ?: $tile->image_title ?: $category->seo_name),
                'categoryName' => (string) $category->seo_name,
                'tourCount' => $this->query($list)->count(),
                'ordered' => $this->positions($list)->exists(),
            ];
        }

        return array_values($lists);
    }

    /**
     * The countries publicly listed tours visit, alphabetical in Hungarian.
     *
     * @return array<int, array{type: string, key: string, label: string, tourCount: int, ordered: bool}>
     */
    public function countryLists(): array
    {
        $counts = [];

        foreach (Tour::query()->listedPublicly()->pluck('country_ids') as $countryIds) {
            foreach (array_unique(array_map('trim', array_map('strval', (array) $countryIds))) as $code) {
                if ($code !== '') {
                    $counts[$code] = ($counts[$code] ?? 0) + 1;
                }
            }
        }

        if ($counts === []) {
            return [];
        }

        $orderedKeys = TourListPosition::query()
            ->where('list_type', TourList::COUNTRY)
            ->distinct()
            ->pluck('list_key')
            ->all();
        $collator = new Collator('hu_HU');

        return TourReferenceOption::query()
            ->where('type', 'country')
            ->where('active', true)
            ->whereIn('code', array_keys($counts))
            ->get(['code', 'name'])
            ->sort(fn (TourReferenceOption $a, TourReferenceOption $b): int => (int) $collator->compare($a->name, $b->name))
            ->map(fn (TourReferenceOption $option): array => [
                'type' => TourList::COUNTRY,
                'key' => (string) $option->code,
                'label' => (string) $option->name,
                'tourCount' => $counts[$option->code],
                'ordered' => in_array($option->code, $orderedKeys, true),
            ])
            ->values()
            ->all();
    }

    /**
     * The publicly listed tours of the list, in the order visitors see them.
     *
     * @return Builder<Tour>
     */
    public function query(TourList $list): Builder
    {
        $query = Tour::query()->listedPublicly();

        if ($list->type === TourList::CATEGORY) {
            $category = BlogCategory::query()->where('active', true)->find($list->key);

            $category
                ? PortfolioOfferQuery::applyCategoryFilter($query, $category)
                : $query->whereRaw('1 = 0');
        } else {
            $query->whereJsonContains('country_ids', $list->key);
        }

        return PortfolioOfferQuery::applyDefaultOrdering($query, $list);
    }

    /**
     * @return Collection<int, Tour>
     */
    public function tours(TourList $list): Collection
    {
        return $this->query($list)->with(['media', 'galleryItems.media'])->get();
    }

    /**
     * The ids of the list's tours the office placed on it.
     *
     * @return array<int, int>
     */
    public function placedTourIds(TourList $list): array
    {
        return $this->positions($list)->pluck('tour_id')->map(fn ($id): int => (int) $id)->all();
    }

    /**
     * Places the given tours on the list in this order; tours left out follow
     * them in the global order.
     *
     * @param  array<int, int>  $tourIds
     */
    public function save(TourList $list, array $tourIds): void
    {
        DB::transaction(function () use ($list, $tourIds): void {
            $this->positions($list)->delete();

            $now = now();

            TourListPosition::query()->insert(array_map(
                fn (int $tourId, int $index): array => [
                    'list_type' => $list->type,
                    'list_key' => $list->key,
                    'tour_id' => $tourId,
                    'position' => $index + 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                array_values($tourIds),
                array_keys(array_values($tourIds)),
            ));
        });

        PublicContentCache::bump(PublicContentCache::OFFERS);
    }

    /**
     * Returns the list to the global tour order.
     */
    public function reset(TourList $list): void
    {
        $this->positions($list)->delete();

        PublicContentCache::bump(PublicContentCache::OFFERS);
    }

    /**
     * @return Builder<TourListPosition>
     */
    private function positions(TourList $list): Builder
    {
        return TourListPosition::query()
            ->where('list_type', $list->type)
            ->where('list_key', $list->key);
    }

    /**
     * The category a homepage tile leads to, read the way the public site
     * routes a tile: a category path or a bare category slug names a category,
     * another path of the site (e.g. an apartment location) or an outside
     * address does not.
     */
    private function categorySlugFromTileLink(string $link): ?string
    {
        $path = rtrim((string) preg_replace('/[?#].*$/', '', trim($link)), '/');

        if ($path === '' || preg_match('#^https?://#i', $path) === 1) {
            return null;
        }

        if (str_starts_with($path, '/') && ! str_starts_with($path, self::CATEGORY_PATH_PREFIX)) {
            return null;
        }

        return Str::afterLast($path, '/') ?: null;
    }
}
