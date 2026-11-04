<?php

namespace App\Support\Tour;

use App\Models\Tour;

/**
 * Place names to start a tour's route map from, read from its program: the
 * day headings ("1. NAP BELGRÁD: világvárosi pezsgés…", program day titles)
 * name the day's places before the colon. Only suggestions — the office
 * looks each one up and decides.
 */
final class RouteStopSuggestions
{
    private const MAX_SUGGESTIONS = 15;

    private const DAY_HEADING = '/^\s*\d+\s*\.\s*nap\b[\s.:,\-–—]*(.+)$/iu';

    /** Words of a day heading that are no place names. */
    private const NOT_PLACES = ['indulás', 'hazautazás', 'hazatérés', 'utazás', 'érkezés', 'szabadprogram', 'szabad program', 'hazaérkezés', 'búcsú', 'reggeli', 'városnézés'];

    /**
     * @return array<int, string>
     */
    public static function for(Tour $tour): array
    {
        $headings = $tour->programDays()->where('active', true)->orderBy('sort_order')->pluck('title')->all();

        foreach (preg_split('/\R/u', html_entity_decode(strip_tags(str_replace(['</p>', '<br>', '<br/>', '<br />'], "\n", (string) $tour->program)))) ?: [] as $line) {
            if (preg_match(self::DAY_HEADING, $line, $match) === 1) {
                $headings[] = $match[1];
            }
        }

        $names = [];

        foreach ($headings as $heading) {
            $heading = preg_replace(self::DAY_HEADING, '$1', (string) $heading) ?? '';

            foreach (preg_split('/\s*[–—,\/]\s*|\s+-\s+|\s+és\s+/u', explode(':', $heading)[0]) ?: [] as $part) {
                $name = self::name($part);

                if ($name !== null && ! in_array($name, $names, true)) {
                    $names[] = $name;
                }
            }
        }

        return array_slice($names, 0, self::MAX_SUGGESTIONS);
    }

    /**
     * The leading capitalised words of a heading part ("PSZCZYNA barokk
     * kastélya" → "Pszczyna"); none when it starts in lower case.
     */
    private static function name(string $part): ?string
    {
        $words = [];

        foreach (preg_split('/\s+/u', trim($part, " \t.!?\"'„”()")) ?: [] as $word) {
            $first = mb_substr($word, 0, 1);

            if ($first === '' || mb_strtoupper($first) !== $first || mb_strtolower($first) === $first) {
                break;
            }

            $words[] = rtrim($word, '.;!?');

            // A sentence ends: what follows is no longer the place's name.
            if (preg_match('/[.;!?]$/u', $word) === 1) {
                break;
            }
        }

        $name = implode(' ', array_slice($words, 0, 3));

        if (mb_strlen($name) < 2 || preg_match('/\d/', $name) === 1 || in_array(mb_strtolower($name), self::NOT_PLACES, true)) {
            return null;
        }

        // Headings are often written in capitals.
        return mb_strtoupper($name) === $name ? mb_convert_case(mb_strtolower($name), MB_CASE_TITLE) : $name;
    }
}
