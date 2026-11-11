<?php

namespace App\Support\Legacy;

use App\Support\PlainText;

/**
 * Plain text out of the legacy admin's HTML fields.
 */
final class LegacyText
{
    /**
     * The text of an HTML fragment on one line, or null when it has none.
     */
    public static function line(mixed $value): ?string
    {
        return PlainText::line($value);
    }

    /**
     * A note as plain text, one line per paragraph; none when it only repeats its label.
     */
    public static function note(mixed $html, mixed $label = null): ?string
    {
        $withBreaks = (string) preg_replace('/<\/p>|<br\s*\/?>/i', "\n", (string) $html);
        $lines = array_values(array_filter(array_map(self::line(...), explode("\n", $withBreaks))));
        $note = implode("\n", $lines);

        return $note === '' || mb_strtolower($note) === mb_strtolower((string) self::line($label)) ? null : $note;
    }
}
