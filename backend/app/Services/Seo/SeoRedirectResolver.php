<?php

namespace App\Services\Seo;

use App\Models\SeoRedirect;

/**
 * Finds where an old address has moved: the active SEO redirect of the path,
 * counted so the office sees which old addresses still get visitors.
 */
class SeoRedirectResolver
{
    /**
     * The target of the path's redirect, or null when it has none.
     */
    public function targetFor(string $path): ?string
    {
        $source = SeoRedirect::normalizePath($path);

        if ($source === '') {
            return null;
        }

        $redirect = SeoRedirect::query()->where('active', true)->where('source_path', $source)->first(['id', 'target']);

        if ($redirect === null) {
            return null;
        }

        SeoRedirect::query()->whereKey($redirect->id)->update(['hits' => SeoRedirect::query()->raw('hits + 1'), 'last_hit_at' => now()]);

        return $redirect->target;
    }
}
