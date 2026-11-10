<?php

namespace App\Support;

/**
 * The site's one forint price format: "68.900 Ft" (dot thousands separator,
 * no decimals).
 */
final class HufPrice
{
    /** A whole amount, digits grouped by spaces or dots, or written together. */
    private const AMOUNT = '(\d{1,3}(?:[ .\x{00A0}\x{202F}]\d{3})+|\d+)';

    public static function format(float|int $amount): string
    {
        return self::amount($amount).' Ft';
    }

    /** The amount alone, e.g. "68.900", for labels that add their own currency. */
    public static function amount(float|int $amount): string
    {
        return number_format(round($amount), 0, ',', '.');
    }

    /**
     * Rewrites the forint amounts in a hand-typed price label into the site's
     * format: "68900" and "68 900,- Ft" both become "68.900 Ft", and
     * "68900 Ft/fő-től" becomes "68.900 Ft/fő-től". Other text is kept.
     */
    public static function normalizeLabel(?string $label): ?string
    {
        $label = trim((string) $label);

        if ($label === '') {
            return null;
        }

        if (preg_match('~^'.self::AMOUNT.'\s*(?:,-)?$~u', $label, $match) === 1) {
            return self::format(self::digits($match[1]));
        }

        return (string) preg_replace_callback(
            '~(?<![\d.,])'.self::AMOUNT.'\s*(?:,-)?\s*(?:Ft|HUF|forint)(?!\p{L})~iu',
            fn (array $match): string => self::format(self::digits($match[1])),
            $label,
        );
    }

    private static function digits(string $amount): int
    {
        return (int) preg_replace('~\D~', '', $amount);
    }
}
