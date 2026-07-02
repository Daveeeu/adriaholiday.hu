<?php

namespace App\Support;

use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Region;
use App\Models\TourRegionGroup;
use App\Models\TourReferenceOption;
use App\Models\TourSeasonalGroup;

class TourLabelResolver
{
    /**
     * @var array<string, array<string, string|null>>
     */
    private static array $referenceOptionLabels = [];

    /**
     * @var array<string, string|null>
     */
    private static array $regionLabels = [];

    /**
     * @var array<string, string|null>
     */
    private static array $regionGroupLabels = [];

    /**
     * @var array<string, string|null>
     */
    private static array $seasonalGroupLabels = [];

    /**
     * @var array<string, string|null>
     */
    private static array $blogTagLabels = [];

    /**
     * @var array<string, string|null>
     */
    private static array $blogCategoryLabels = [];

    /**
     * @return array<int, array{id: string, label: string}>
     */
    public static function referenceOptionItems(string $type, array $ids): array
    {
        $ids = self::normalizeIds($ids);
        self::loadReferenceOptionLabels($type, $ids);

        return array_values(array_filter(array_map(
            function (string $id) use ($type): ?array {
                $label = self::referenceOptionLabel($type, $id);

                if ($label === null) {
                    return null;
                }

                return [
                    'id' => $id,
                    'label' => $label,
                ];
            },
            $ids,
        )));
    }

    public static function referenceOptionLabel(string $type, ?string $id): ?string
    {
        if (! $id) {
            return null;
        }

        self::loadReferenceOptionLabels($type, [$id]);

        return self::$referenceOptionLabels[$type][$id] ?? null;
    }

    public static function regionLabel(?Region $region, ?string $regionId = null): ?string
    {
        if ($region?->name) {
            return $region->name;
        }

        return self::labelFromModelCache(self::$regionLabels, $regionId, fn (string $id): ?string => Region::query()
            ->whereKey($id)
            ->value('name'));
    }

    public static function regionGroupLabel(?string $seoName): ?string
    {
        return self::labelFromModelCache(self::$regionGroupLabels, $seoName, fn (string $id): ?string => TourRegionGroup::query()
            ->where('seo_name', $id)
            ->value('name'));
    }

    public static function seasonalGroupLabel(?string $seoName): ?string
    {
        return self::labelFromModelCache(self::$seasonalGroupLabels, $seoName, fn (string $id): ?string => TourSeasonalGroup::query()
            ->where('seo_name', $id)
            ->value('name'));
    }

    public static function blogTagLabel(?string $id): ?string
    {
        return self::labelFromModelCache(self::$blogTagLabels, $id, function (string $value): ?string {
            $tag = BlogTag::query()->with('translations')->find($value);

            return $tag ? self::translationLabel($tag->translations) : null;
        });
    }

    public static function blogCategoryLabel(?string $id): ?string
    {
        return self::labelFromModelCache(self::$blogCategoryLabels, $id, function (string $value): ?string {
            $category = BlogCategory::query()->with('translations')->find($value);

            return $category ? self::translationLabel($category->translations) : null;
        });
    }

    /**
     * @return array<int, array{id: string, label: string}>
     */
    public static function blogTagItems(array $ids): array
    {
        $ids = self::normalizeIds($ids);

        return array_values(array_filter(array_map(
            function (string $id): ?array {
                $label = self::blogTagLabel($id);

                if ($label === null) {
                    return null;
                }

                return [
                    'id' => $id,
                    'label' => $label,
                ];
            },
            $ids,
        )));
    }

    /**
     * @return array<int, array{id: string, label: string}>
     */
    public static function blogCategoryItems(array $ids): array
    {
        $ids = self::normalizeIds($ids);

        return array_values(array_filter(array_map(
            function (string $id): ?array {
                $label = self::blogCategoryLabel($id);

                if ($label === null) {
                    return null;
                }

                return [
                    'id' => $id,
                    'label' => $label,
                ];
            },
            $ids,
        )));
    }

    /**
     * @param  array<string, string|null>  $cache
     */
    private static function labelFromModelCache(array &$cache, ?string $id, callable $resolver): ?string
    {
        if (! $id) {
            return null;
        }

        if (! array_key_exists($id, $cache)) {
            $cache[$id] = $resolver($id);
        }

        return $cache[$id];
    }

    /**
     * @param  array<int, string>  $ids
     */
    private static function loadReferenceOptionLabels(string $type, array $ids): void
    {
        $ids = self::normalizeIds($ids);

        if ($ids === []) {
            return;
        }

        self::$referenceOptionLabels[$type] ??= [];

        $missing = array_values(array_diff($ids, array_keys(self::$referenceOptionLabels[$type])));
        if ($missing === []) {
            return;
        }

        TourReferenceOption::query()
            ->where('type', $type)
            ->whereIn('code', $missing)
            ->get(['code', 'name'])
            ->each(function (TourReferenceOption $option) use ($type): void {
                self::$referenceOptionLabels[$type][$option->code] = $option->name;
            });

        foreach ($missing as $missingId) {
            self::$referenceOptionLabels[$type][$missingId] ??= null;
        }
    }

    /**
     * @param  array<int, mixed>  $ids
     * @return array<int, string>
     */
    private static function normalizeIds(array $ids): array
    {
        return array_values(array_filter(array_map(
            fn ($id): string => trim((string) $id),
            $ids,
        ), fn (string $id): bool => $id !== ''));
    }

    /**
     * @param  \Illuminate\Support\Collection<int, mixed>|array<int, mixed>|null  $translations
     */
    private static function translationLabel($translations): ?string
    {
        $collection = collect($translations);
        $translation = $collection->firstWhere('locale', 'hu') ?? $collection->first();

        return $translation?->name ?: null;
    }
}
