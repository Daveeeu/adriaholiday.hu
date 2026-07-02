<?php

namespace App\Support;

use App\Models\BlogCategory;
use App\Models\BlogTagTranslation;
use App\Models\PortfolioFilterChip;
use App\Models\Tour;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class PortfolioOfferQuery
{
    public static function buildBaseQuery(Request $request): Builder
    {
        $query = Tour::query()
            ->where('active', true)
            ->with(['region', 'dates', 'media']);

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('seo_name', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%")
                    ->orWhere('list_description', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if ($region = trim((string) $request->query('region', ''))) {
            $query->where(function (Builder $builder) use ($region): void {
                $builder->whereHas('region', function (Builder $regionQuery) use ($region): void {
                    $regionQuery->where('slug', 'like', "%{$region}%")
                        ->orWhere('name', 'like', "%{$region}%");
                })->orWhere('notes', 'like', "%{$region}%");
            });
        }

        if ($category = trim((string) $request->query('category', ''))) {
            $query->where(function (Builder $builder) use ($category): void {
                $builder->whereJsonContains('category_ids', $category)
                    ->orWhere('name', 'like', "%{$category}%")
                    ->orWhere('notes', 'like', "%{$category}%");
            });
        }

        if ($tag = trim((string) $request->query('tag', ''))) {
            $query->where(function (Builder $builder) use ($tag): void {
                $builder->whereJsonContains('tag_ids', $tag)
                    ->orWhere('name', 'like', "%{$tag}%")
                    ->orWhere('short_description', 'like', "%{$tag}%")
                    ->orWhere('list_description', 'like', "%{$tag}%")
                    ->orWhere('notes', 'like', "%{$tag}%");
            });
        }

        if ($country = trim((string) $request->query('country', ''))) {
            $query->whereJsonContains('country_ids', $country);
        }

        if (($maxPrice = $request->query('maxPrice')) !== null && $maxPrice !== '') {
            $price = (float) $maxPrice;
            if ($price > 0) {
                $query->whereNotNull('price')->where('price', '<=', $price);
            }
        }

        if ($transport = trim((string) $request->query('transport', ''))) {
            $query->where('travel_mode_id', $transport);
        }

        if (($featured = $request->query('featured')) !== null && $featured !== '' && $featured !== 'all') {
            $query->where('featured', filter_var($featured, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
        }

        return self::applyOrdering($query, $request);
    }

    public static function applyCategoryScope(Builder $query, string $slug): Builder
    {
        $category = BlogCategory::query()
            ->where('active', true)
            ->where(function (Builder $builder) use ($slug): void {
                $builder->where('seo_name', $slug)
                    ->orWhereHas('translations', function (Builder $translationQuery) use ($slug): void {
                        $translationQuery->where('seo_name', $slug);
                    });
            })
            ->first();

        if (! $category) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereJsonContains('category_ids', (string) $category->id);
    }

    /**
     * @return array<int, string>
     */
    public static function parseFilterSlugs(?string $value): array
    {
        return array_values(array_filter(array_unique(array_map(
            static fn (string $item): string => trim($item),
            explode(',', (string) $value),
        ))));
    }

    /**
     * @return Collection<int, PortfolioFilterChip>
     */
    public static function resolveScopedFilterChips(string $slug): Collection
    {
        return PortfolioFilterChip::query()
            ->where('active', true)
            ->where(function (Builder $builder) use ($slug): void {
                $builder->where('scope_type', 'global')
                    ->orWhere(function (Builder $categoryBuilder) use ($slug): void {
                        $categoryBuilder->where('scope_type', 'category')
                            ->where('scope_value', $slug);
                    });
            })
            ->orderBy('sort_order')
            ->orderBy('label')
            ->get();
    }

    public static function applyRequestChipFilters(Builder $query, Request $request, string $scopeSlug): Builder
    {
        $selected = self::resolveSelectedFilterChips($scopeSlug, self::parseFilterSlugs($request->query('filters')));

        return self::applyFilterChips($query, $selected);
    }

    /**
     * @param  array<int, string>  $slugs
     * @return Collection<int, PortfolioFilterChip>
     */
    public static function resolveSelectedFilterChips(string $scopeSlug, array $slugs): Collection
    {
        if ($slugs === []) {
            return collect();
        }

        return self::resolveScopedFilterChips($scopeSlug)
            ->filter(fn (PortfolioFilterChip $chip): bool => in_array($chip->slug, $slugs, true))
            ->values();
    }

    /**
     * @param  iterable<PortfolioFilterChip>  $chips
     */
    public static function applyFilterChips(Builder $query, iterable $chips): Builder
    {
        foreach ($chips as $chip) {
            self::applyFilterChip($query, $chip);
        }

        return $query;
    }

    public static function buildPublicChipPayload(Request $request, string $scopeSlug): array
    {
        $selectedSlugs = self::parseFilterSlugs($request->query('filters'));
        $selected = self::resolveSelectedFilterChips($scopeSlug, $selectedSlugs)->keyBy('slug');
        $chips = self::resolveScopedFilterChips($scopeSlug);

        return $chips->map(function (PortfolioFilterChip $chip) use ($request, $scopeSlug, $selected, $selectedSlugs): ?array {
            $otherSelected = $selected->except($chip->slug)->values();

            $query = self::buildBaseQuery($request);
            self::applyCategoryScope($query, $scopeSlug);
            self::applyFilterChips($query, $otherSelected);
            self::applyFilterChip($query, $chip);

            $count = (clone $query)->count();
            $isActive = in_array($chip->slug, $selectedSlugs, true);

            if ($count === 0 && $chip->hide_when_zero) {
                return null;
            }

            return [
                'label' => $chip->label,
                'slug' => $chip->slug,
                'icon' => $chip->icon,
                'type' => $chip->filter_type,
                'value' => $chip->filter_value,
                'count' => $count,
                'disabled' => $count === 0 && ! $isActive,
                'active' => $isActive,
            ];
        })->filter()->values()->all();
    }

    public static function applyFilterChip(Builder $query, PortfolioFilterChip $chip): Builder
    {
        $value = (string) ($chip->filter_value ?? '');
        $config = is_array($chip->filter_config) ? $chip->filter_config : [];

        return match ($chip->filter_type) {
            'tag' => $value !== '' ? $query->whereJsonContains('tag_ids', $value) : $query,
            'theme' => self::applyThemeFilter($query, $value),
            'category' => $value !== '' ? $query->whereJsonContains('category_ids', $value) : $query,
            'travel_mode' => $value !== '' ? $query->where('travel_mode_id', $value) : $query,
            'country' => $value !== '' ? $query->whereJsonContains('country_ids', $value) : $query,
            'price' => self::applyPriceFilter($query, $config, $value),
            default => $query,
        };
    }

    /**
     * @param  array<string, mixed>  $config
     */
    private static function applyPriceFilter(Builder $query, array $config, string $value): Builder
    {
        $max = isset($config['max']) ? (float) $config['max'] : null;
        $min = isset($config['min']) ? (float) $config['min'] : null;

        if ($max === null && is_numeric($value)) {
            $max = (float) $value;
        }

        if ($min !== null) {
            $query->whereNotNull('price')->where('price', '>=', $min);
        }

        if ($max !== null) {
            $query->whereNotNull('price')->where('price', '<=', $max);
        }

        return $query;
    }

    private static function applyThemeFilter(Builder $query, string $value): Builder
    {
        if ($value === '') {
            return $query;
        }

        $tagId = self::resolveThemeTagId($value);

        if ($tagId === null) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereJsonContains('tag_ids', $tagId);
    }

    private static function resolveThemeTagId(string $value): ?string
    {
        static $cache = [];

        if (array_key_exists($value, $cache)) {
            return $cache[$value];
        }

        if (is_numeric($value)) {
            return $cache[$value] = (string) $value;
        }

        $normalized = str_replace('-', ' ', $value);
        $tagTranslation = BlogTagTranslation::query()
            ->where('locale', 'hu')
            ->get(['blog_tag_id', 'name'])
            ->first(function (BlogTagTranslation $translation) use ($value, $normalized): bool {
                return str($translation->name)->slug()->toString() === $value
                    || str($translation->name)->slug()->toString() === str($normalized)->slug()->toString();
            });

        return $cache[$value] = $tagTranslation ? (string) $tagTranslation->blog_tag_id : null;
    }

    private static function applyOrdering(Builder $query, Request $request): Builder
    {
        $order = strtolower((string) $request->query('order', 'sort_order'));

        if ($order === 'warmest') {
            $warmChip = PortfolioFilterChip::query()
                ->where('active', true)
                ->where('slug', 'meleg-uti-celok')
                ->first();

            if ($warmChip?->filter_value) {
                $tagId = self::resolveThemeTagId((string) $warmChip->filter_value);

                if (! $tagId) {
                    return $query->orderBy('sort_order')->orderByDesc('created_at');
                }

                $needle = '%"'.$tagId.'"%';

                return $query
                    ->orderByRaw('case when tag_ids like ? then 0 else 1 end asc', [$needle])
                    ->orderBy('sort_order')
                    ->orderByDesc('created_at');
            }
        }

        return match ($order) {
            'price_asc' => $query->orderByRaw('coalesce(price, 0) asc')->orderBy('sort_order'),
            'price_desc' => $query->orderByRaw('coalesce(price, 0) desc')->orderBy('sort_order'),
            'newest' => $query->orderByDesc('created_at')->orderBy('sort_order'),
            'oldest' => $query->orderBy('created_at')->orderBy('sort_order'),
            'name' => $query->orderBy('name')->orderBy('sort_order'),
            default => $query->orderBy('sort_order')->orderByDesc('created_at'),
        };
    }
}
