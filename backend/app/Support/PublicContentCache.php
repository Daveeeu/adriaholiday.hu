<?php

namespace App\Support;

use Closure;
use Illuminate\Support\Facades\Cache;

class PublicContentCache
{
    public const BLOG = 'blog';

    public const CATEGORY_LIST = 'category-list';

    public const HOMEPAGE_CONTENT = 'homepage-content';

    public const PORTFOLIO_FILTERS = 'portfolio-filters';

    public const REGIONS = 'regions';

    public const SITEMAP = 'sitemap';

    public const SITE_SETTINGS = 'site-settings';

    public static function remember(string $scope, string $suffix, int $seconds, Closure $resolver): mixed
    {
        $version = (int) Cache::get(self::versionKey($scope), 1);

        return Cache::remember(self::cacheKey($scope, $version, $suffix), $seconds, $resolver);
    }

    public static function bump(string ...$scopes): void
    {
        foreach (array_unique($scopes) as $scope) {
            $key = self::versionKey($scope);
            $current = (int) Cache::get($key, 1);

            Cache::forever($key, $current + 1);
        }
    }

    public static function fingerprint(array $payload): string
    {
        return md5(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '');
    }

    private static function versionKey(string $scope): string
    {
        return "public-content-cache:{$scope}:version";
    }

    private static function cacheKey(string $scope, int $version, string $suffix): string
    {
        return "public-content-cache:{$scope}:v{$version}:{$suffix}";
    }
}
