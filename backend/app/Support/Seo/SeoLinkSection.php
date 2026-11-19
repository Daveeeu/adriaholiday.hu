<?php

namespace App\Support\Seo;

/**
 * A titled list of links in a page's crawlable content, such as the trips of a
 * category or the apartments of a location.
 */
final class SeoLinkSection
{
    /**
     * @param  array<int, SeoLink>  $links
     */
    public function __construct(
        public readonly string $title,
        public readonly array $links,
    ) {}
}
