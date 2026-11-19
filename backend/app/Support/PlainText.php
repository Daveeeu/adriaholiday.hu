<?php

namespace App\Support;

/**
 * Plain text out of a value that may hold HTML.
 */
final class PlainText
{
    /**
     * The text of an HTML fragment on one line, or null when it has none.
     */
    public static function line(mixed $value): ?string
    {
        $text = trim((string) preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags((string) $value), ENT_QUOTES | ENT_HTML5, 'UTF-8')));

        return $text !== '' ? $text : null;
    }

    /**
     * The text of an HTML fragment as paragraphs: one per block element or line break.
     *
     * @return array<int, string>
     */
    public static function paragraphs(mixed $value): array
    {
        $blocks = (string) preg_replace('~<(?:br\s*/?|/(?:p|div|li|h[1-6]|tr|blockquote))>~i', "\n", (string) $value);

        return array_values(array_filter(array_map(
            fn (string $line): ?string => self::line($line),
            preg_split('/\R/u', $blocks) ?: [],
        )));
    }
}
