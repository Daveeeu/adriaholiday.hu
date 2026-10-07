<?php

namespace App\Support;

use App\Models\BlogCategory;
use Illuminate\Support\Str;

/**
 * Category pages (/kategoriak/{slug}) exist only for active portfolio (blog)
 * categories; links to any other slug lead to a 404.
 */
final class PortfolioCategoryLinks
{
    private const PREFIX = '/kategoriak/';

    /**
     * @return array<int, string> slugs that have a category page
     */
    public static function existingSlugs(): array
    {
        return BlogCategory::query()
            ->where('active', true)
            ->with('translations')
            ->get()
            ->flatMap(fn (BlogCategory $category): array => [$category->seo_name, ...$category->translations->pluck('seo_name')->all()])
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Whether a link works: anything that is not a category page counts as working.
     *
     * @param  array<int, string>  $existingSlugs
     */
    public static function leadsToPage(?string $link, array $existingSlugs): bool
    {
        $path = '/'.ltrim((string) (parse_url(trim((string) $link), PHP_URL_PATH) ?: ''), '/');

        return ! str_starts_with($path, self::PREFIX)
            || in_array(trim(Str::after($path, self::PREFIX), '/'), $existingSlugs, true);
    }
}
