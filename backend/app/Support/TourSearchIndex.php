<?php

namespace App\Support;

use App\Models\Region;
use App\Models\Tour;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * The public offer search matches whole words of a tour's search keywords, name,
 * countries and region, ignoring accents and case: "roma" finds Róma but not
 * Románia or "romantikus". The words are kept, normalised, in the tour's
 * search_index column (" roma vatikan olaszorszag "), rebuilt on every save.
 */
final class TourSearchIndex
{
    public const MAX_KEYWORDS = 50;

    public const MAX_KEYWORD_LENGTH = 100;

    /**
     * Lower-case ASCII words separated by single spaces: "Szent Péter-bazilika" → "szent peter bazilika".
     */
    public static function normalize(string $text): string
    {
        $ascii = Str::ascii(Str::lower(html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5)));

        return trim((string) preg_replace('/[^a-z0-9]+/', ' ', $ascii));
    }

    /**
     * The distinct words of a search query, normalised as the index is.
     *
     * @return array<int, string>
     */
    public static function queryWords(string $query): array
    {
        return self::words(self::normalize($query));
    }

    /**
     * Whether an index holds every one of the words.
     *
     * @param  array<int, string>  $words
     */
    public static function indexMatches(string $index, array $words): bool
    {
        foreach ($words as $word) {
            if (! str_contains($index, " {$word} ")) {
                return false;
            }
        }

        return $words !== [];
    }

    public static function build(Tour $tour): string
    {
        $texts = [
            ...self::cleanKeywords($tour->search_keywords ?? []),
            (string) $tour->name,
            ...self::countryNames($tour),
            (string) self::regionName($tour),
        ];

        $words = self::words(self::normalize(implode(' ', $texts)));

        return $words === [] ? '' : ' '.implode(' ', $words).' ';
    }

    /**
     * Rebuilds the index of tours whose region or country got renamed; written
     * directly, as the tours themselves did not change.
     *
     * @param  Builder<Tour>  $tours
     */
    public static function refresh(Builder $tours): void
    {
        TourLabelResolver::flush();

        $tours->with('region')->each(function (Tour $tour): void {
            DB::table('tours')->where('id', $tour->id)->update(['search_index' => self::build($tour)]);
        });
    }

    /**
     * Keywords to start from: the places the short description lists
     * ("Trieszt-Velence-Padova-Verona"). The name, countries and region are
     * searchable anyway.
     *
     * @return array<int, string>
     */
    public static function suggestKeywords(Tour $tour): array
    {
        $text = html_entity_decode(strip_tags((string) $tour->short_description), ENT_QUOTES | ENT_HTML5);
        $segments = preg_split('/\s*(?:[-–—,;\/•|]|\s+és\s+)\s*/u', $text) ?: [];

        $places = array_filter(
            array_map(fn (string $segment): string => trim($segment, " \t\n\r\0\x0B.:"), $segments),
            fn (string $segment): bool => mb_strlen($segment) >= 2
                && mb_strlen($segment) <= 60
                && ! preg_match('/\d/', $segment)
                && preg_match('/^\p{Lu}/u', $segment) === 1,
        );

        return self::cleanKeywords($places);
    }

    /**
     * Trimmed, non-empty keywords without duplicates (ignoring accents and case),
     * within the stored limits.
     *
     * @param  iterable<mixed>  $keywords
     * @return array<int, string>
     */
    public static function cleanKeywords(iterable $keywords): array
    {
        $clean = [];

        foreach ($keywords as $keyword) {
            $keyword = trim((string) preg_replace('/\s+/u', ' ', (string) $keyword));
            $key = self::normalize($keyword);

            if ($key === '' || isset($clean[$key])) {
                continue;
            }

            $clean[$key] = mb_substr($keyword, 0, self::MAX_KEYWORD_LENGTH);
        }

        return array_slice(array_values($clean), 0, self::MAX_KEYWORDS);
    }

    /**
     * @return array<int, string>
     */
    public static function countryNames(Tour $tour): array
    {
        return array_column(TourLabelResolver::referenceOptionItems('country', $tour->country_ids ?? []), 'label');
    }

    public static function regionName(Tour $tour): ?string
    {
        if ($tour->region_id === null) {
            return null;
        }

        return $tour->relationLoaded('region') && $tour->region?->getKey() === $tour->region_id
            ? $tour->region->name
            : Region::query()->whereKey($tour->region_id)->value('name');
    }

    /**
     * @return array<int, string>
     */
    private static function words(string $normalized): array
    {
        return array_values(array_unique(array_filter(explode(' ', $normalized), fn (string $word): bool => $word !== '')));
    }
}
