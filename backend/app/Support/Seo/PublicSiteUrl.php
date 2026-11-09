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
     * The clean form of an address carrying the front controller's name or a
     * trailing slash ("/index.php/kapcsolat", "/kapcsolat/"), which would otherwise
     * answer as a duplicate of the page; null when the address is already clean.
     */
    public static function cleanRequestUri(Request $request): ?string
    {
        [$path, $query] = array_pad(explode('?', $request->getRequestUri(), 2), 2, null);
        $cleanPath = '/'.trim((string) preg_replace('~^/index\.php(?=/|$)~', '', $path), '/');

        if ($cleanPath === $path) {
            return null;
        }

        return $query === null ? $cleanPath : "{$cleanPath}?{$query}";
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
