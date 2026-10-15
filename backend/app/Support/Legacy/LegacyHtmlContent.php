<?php

namespace App\Support\Legacy;

use App\Support\RichTextSanitizer;
use Closure;

/**
 * A legacy HTML field as the new site stores it: the images it shows point to
 * their copy in our media library, then it is sanitized like every rich text.
 * The original HTML itself is kept word for word elsewhere (see
 * LegacyImportRecord), so nothing here is lost.
 */
final class LegacyHtmlContent
{
    private const IMAGE_SOURCE = '/(<img\b[^>]*?\bsrc\s*=\s*)(["\'])(.*?)\2/is';

    /**
     * Absolute URLs of the images an HTML fragment shows, relative sources
     * ("files/Kuba/x.jpg") read against the legacy site.
     *
     * @return array<int, string>
     */
    public static function imageUrls(?string $html, string $legacyBaseUrl): array
    {
        preg_match_all(self::IMAGE_SOURCE, (string) $html, $matches);

        return collect($matches[3] ?? [])
            ->map(fn (string $source): ?string => self::absoluteUrl(html_entity_decode($source, ENT_QUOTES | ENT_HTML5, 'UTF-8'), $legacyBaseUrl))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @param  Closure(string): ?string  $localUrl  the media library URL of a legacy image, if mirrored
     */
    public static function prepare(?string $html, string $legacyBaseUrl, Closure $localUrl): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        $withLocalImages = (string) preg_replace_callback(self::IMAGE_SOURCE, function (array $match) use ($legacyBaseUrl, $localUrl): string {
            $absolute = self::absoluteUrl(html_entity_decode($match[3], ENT_QUOTES | ENT_HTML5, 'UTF-8'), $legacyBaseUrl);
            $source = $absolute !== null ? ($localUrl($absolute) ?? $absolute) : $match[3];

            return $match[1].$match[2].htmlspecialchars($source, ENT_QUOTES | ENT_HTML5, 'UTF-8').$match[2];
        }, $html);

        $sanitized = RichTextSanitizer::sanitize($withLocalImages);

        return $sanitized !== null && (LegacyText::line($sanitized) !== null || str_contains($sanitized, '<img')) ? $sanitized : null;
    }

    public static function absoluteUrl(string $source, string $legacyBaseUrl): ?string
    {
        $source = trim($source);

        return match (true) {
            $source === '', str_starts_with($source, 'data:') => null,
            (bool) preg_match('~^https?://~i', $source) => $source,
            str_starts_with($source, '//') => 'https:'.$source,
            default => rtrim($legacyBaseUrl, '/').'/'.ltrim($source, '/'),
        };
    }
}
