<?php

namespace App\Support\Legacy\Apartments;

use App\Support\Legacy\LegacyText;
use App\Support\RichTextSanitizer;

/**
 * A legacy apartment HTML field as the new site stores it. Links to pages of
 * the legacy site ("apartmanok/veneto/bibione#strand_bibione", or the full
 * address) become site-relative, since the new site keeps those URLs; then
 * it is sanitized like every rich text. The original stays word for word in
 * the import record.
 */
final class LegacyApartmentHtml
{
    private const LINK = '/(<a\b[^>]*?\bhref\s*=\s*)(["\'])(.*?)\2/is';

    public static function prepare(mixed $html): ?string
    {
        if (! is_string($html) || LegacyText::line($html) === null) {
            return null;
        }

        $withSiteLinks = (string) preg_replace_callback(
            self::LINK,
            fn (array $match): string => $match[1].$match[2].self::siteRelative(html_entity_decode($match[3], ENT_QUOTES | ENT_HTML5, 'UTF-8')).$match[2],
            $html,
        );

        $sanitized = RichTextSanitizer::sanitize($withSiteLinks);

        return $sanitized !== null && LegacyText::line($sanitized) !== null ? $sanitized : null;
    }

    private static function siteRelative(string $href): string
    {
        $href = trim($href);

        if (preg_match('~^https?://(?:www\.)?adriaholiday\.hu(/.*)?$~i', $href, $match)) {
            return htmlspecialchars(($match[1] ?? '') !== '' ? $match[1] : '/', ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }

        if ($href !== '' && ! preg_match('~^([a-z][a-z0-9+.-]*:|/|#|\.)~i', $href)) {
            $href = '/'.$href;
        }

        return htmlspecialchars($href, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}
