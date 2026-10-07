<?php

namespace App\Support\Seo;

use Illuminate\Http\Request;

/**
 * The public site's canonical origin (config seo.site_url) and URLs on it.
 */
final class PublicSiteUrl
{
    public static function base(): string
    {
        return (string) config('seo.site_url');
    }

    public static function to(string $path): string
    {
        return self::base().($path === '/' || $path === '' ? '/' : '/'.ltrim($path, '/'));
    }

    /**
     * Whether the request reached the canonical host; any other host (staging,
     * server IP, old aliases) must not be indexed.
     */
    public static function isCanonicalHost(Request $request): bool
    {
        return strcasecmp($request->getHost(), (string) parse_url(self::base(), PHP_URL_HOST)) === 0;
    }
}
