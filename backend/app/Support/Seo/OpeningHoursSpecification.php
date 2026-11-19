<?php

namespace App\Support\Seo;

use Illuminate\Support\Str;

/**
 * The office's opening hours setting ("Hétfő–Péntek: 08:00–17:00", one range
 * per line) as schema.org OpeningHoursSpecification entries. Closed days
 * ("Szombat–Vasárnap: zárva") and lines it cannot read are left out.
 */
final class OpeningHoursSpecification
{
    /**
     * @var array<string, string> Hungarian day name (slug) => schema.org day
     */
    private const DAYS = [
        'hetfo' => 'Monday',
        'kedd' => 'Tuesday',
        'szerda' => 'Wednesday',
        'csutortok' => 'Thursday',
        'pentek' => 'Friday',
        'szombat' => 'Saturday',
        'vasarnap' => 'Sunday',
    ];

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function fromText(string $text): array
    {
        $specifications = [];

        foreach (preg_split('/\R/u', $text) ?: [] as $line) {
            if (preg_match('/^\s*([^:–-]+?)\s*(?:[–-]\s*([^:]+?))?\s*:\s*(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})\s*$/u', $line, $match) !== 1) {
                continue;
            }

            $days = self::dayRange($match[1], $match[2] !== '' ? $match[2] : $match[1]);

            if ($days === []) {
                continue;
            }

            $specifications[] = [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => $days,
                'opens' => self::time($match[3]),
                'closes' => self::time($match[4]),
            ];
        }

        return $specifications;
    }

    /**
     * @return array<int, string>
     */
    private static function dayRange(string $from, string $to): array
    {
        $days = array_keys(self::DAYS);
        $start = array_search(Str::slug($from), $days, true);
        $end = array_search(Str::slug($to), $days, true);

        if ($start === false || $end === false || $end < $start) {
            return [];
        }

        return array_map(fn (string $day): string => self::DAYS[$day], array_slice($days, $start, $end - $start + 1));
    }

    private static function time(string $time): string
    {
        return str_pad($time, 5, '0', STR_PAD_LEFT);
    }
}
