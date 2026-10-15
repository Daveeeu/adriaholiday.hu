<?php

namespace App\Support\Seo;

/**
 * A page's own robots setting (e.g. a tour's "noindex, follow"), applied
 * only where it restricts crawlers: "index, follow" and empty values leave
 * the site's default, and a site that is not indexed at all (staging) stays
 * so whatever a page says.
 */
final class RobotsDirective
{
    private const KNOWN = ['index', 'noindex', 'follow', 'nofollow', 'noarchive', 'nosnippet', 'noimageindex'];

    /**
     * The normalized directive ("noindex,follow") when it restricts crawlers, else null.
     */
    public static function restrictive(?string $robots): ?string
    {
        $tokens = collect(explode(',', strtolower((string) $robots)))
            ->map(fn (string $token): string => trim($token))
            ->filter(fn (string $token): bool => in_array($token, self::KNOWN, true))
            ->unique()
            ->values();

        return $tokens->contains(fn (string $token): bool => str_starts_with($token, 'no')) ? $tokens->implode(',') : null;
    }
}
