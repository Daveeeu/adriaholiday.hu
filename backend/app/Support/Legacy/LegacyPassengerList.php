<?php

namespace App\Support\Legacy;

/**
 * The passenger list of a legacy booking form, one text for all passengers:
 * "Name [útiokmány: X, lakcím: Y, születési dátum: Z], …" (older bookings say
 * "szig.sz." for the document number).
 */
final class LegacyPassengerList
{
    private const LABELS = ['útiokmány', 'szig.sz.', 'u.sz.', 'u.sz', 'lakcím', 'születési dátum'];

    /**
     * @return array<int, array{name?: string, document_number?: string, address?: string, birth_date?: string}>
     */
    public static function parse(string $text): array
    {
        preg_match_all('/([^\[\],][^\[\]]*?)\s*\[([^\]]*)\]/u', $text, $matches, PREG_SET_ORDER);

        return array_values(array_filter(array_map(function (array $match): array {
            $details = $match[2];

            return array_filter([
                'name' => trim($match[1], " ,\t\n"),
                'document_number' => self::labelled($details, 'útiokmány') ?? self::labelled($details, 'szig.sz.'),
                'address' => self::labelled($details, 'lakcím'),
                'birth_date' => self::labelled($details, 'születési dátum'),
            ], fn (?string $value): bool => $value !== null && $value !== '');
        }, $matches)));
    }

    private static function labelled(string $details, string $label): ?string
    {
        $others = implode('|', array_map(fn (string $other): string => preg_quote($other, '/'), self::LABELS));
        $pattern = '/'.preg_quote($label, '/').':\s*(.*?)\s*(?:,\s*(?:'.$others.'):|$)/u';

        if (! preg_match($pattern, $details, $match)) {
            return null;
        }

        $value = trim(trim($match[1]), ' ,');

        return $value === '' ? null : $value;
    }
}
