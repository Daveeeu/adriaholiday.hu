<?php

namespace App\Support\Legacy;

/**
 * The address a legacy URL is downloaded from. Once adriaholiday.hu serves
 * the new site, the legacy server stays reachable on another host
 * (services.legacy_adria.fetch_origin, e.g. http://admin.adriaholiday.hu); the
 * legacy URL itself stays the record's identity, so nothing is copied twice.
 */
final class LegacyFetchUrl
{
    private const LEGACY_HOSTS = ['adriaholiday.hu', 'www.adriaholiday.hu'];

    public static function for(string $url): string
    {
        $origin = rtrim((string) config('services.legacy_adria.fetch_origin'), '/');
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));

        if ($origin === '' || ! in_array($host, self::LEGACY_HOSTS, true)) {
            return $url;
        }

        return $origin.preg_replace('#^https?://[^/]+#i', '', $url);
    }
}
