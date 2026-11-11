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
}
