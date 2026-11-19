<?php

namespace App\Support\Seo;

/**
 * One link of a page's crawlable content: the linked page's name, address and
 * a short line about it (route, price, dates). An empty path lists the label
 * as plain text (an office address, opening hours).
 */
final class SeoLink
{
    public function __construct(
        public readonly string $label,
        public readonly string $path,
        public readonly ?string $detail = null,
    ) {}
}
