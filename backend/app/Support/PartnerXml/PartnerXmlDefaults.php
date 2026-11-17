<?php

namespace App\Support\PartnerXml;

use App\Models\Tour;
use App\Support\Booking\BookingInsuranceSettings;
use App\Support\TourLabelResolver;

/**
 * What a tour's partner feed settings default to, from the tour's own data:
 * the office only fills in what differs. Stored settings win; one left empty
 * follows the tour (a new accommodation shows up in the feeds by itself).
 */
final class PartnerXmlDefaults
{
    /** Each partner's travel type of a round trip and of a city break (config/partner_xml.php). */
    private const TRAVEL_TYPES = [
        'round_trip' => ['general' => 1, 'travelgate' => 1, 'cesys' => 1, 'travelmax' => [1]],
        'city_break' => ['general' => 3, 'travelgate' => 2, 'cesys' => 3, 'travelmax' => [13]],
    ];

    /**
     * The defaults in the shape of PartnerXmlSettings::normalize().
     *
     * @return array{country_id: int|null, country_name: string|null, accommodation_name: string|null, city: string|null, insurance_value: int|null, accommodation_description_travelmax: string|null, travel_types: array{general: int|null, travelgate: int|null, cesys: int|null, travelmax: list<int>}}
     */
    public static function for(Tour $tour): array
    {
        $countryName = self::text($tour->region?->name) ?? self::firstCountryName($tour);

        return [
            'country_id' => PartnerXmlSettings::legacyRegionId($countryName),
            'country_name' => $countryName,
            'accommodation_name' => self::accommodationType($tour->accommodation),
            // The place the travellers stay at, else the country they travel to.
            'city' => self::accommodationStop($tour) ?? $countryName,
            'insurance_value' => self::insuranceDailyFee(),
            'accommodation_description_travelmax' => self::text($tour->accommodation_info),
            'travel_types' => self::TRAVEL_TYPES[$tour->program_type_id === 'city-break' ? 'city_break' : 'round_trip'],
        ];
    }

    /**
     * The settings the feeds use: each stored one, else its default.
     *
     * @return array{country_id: int|null, country_name: string|null, accommodation_name: string|null, city: string|null, insurance_value: int|null, accommodation_description_travelmax: string|null, travel_types: array{general: int|null, travelgate: int|null, cesys: int|null, travelmax: list<int>}}
     */
    public static function effective(Tour $tour): array
    {
        $stored = PartnerXmlSettings::normalize($tour->partner_xml);
        $defaults = self::for($tour);
        $settings = $stored;

        foreach ($defaults as $key => $default) {
            if ($key !== 'travel_types' && $stored[$key] === null) {
                $settings[$key] = $default;
            }
        }

        foreach ($defaults['travel_types'] as $partner => $default) {
            if (in_array($stored['travel_types'][$partner], [null, []], true)) {
                $settings['travel_types'][$partner] = $default;
            }
        }

        return $settings;
    }

    /**
     * The settings to store: a value the editor showed as the default and
     * the office left as it was is stored empty, so it keeps following the
     * tour.
     *
     * @param  array<string, mixed>  $settings  normalized
     * @param  array<string, mixed>  $defaults  the defaults the editor showed
     * @return array<string, mixed>
     */
    public static function withoutDefaults(array $settings, array $defaults): array
    {
        foreach ($defaults as $key => $default) {
            if ($key !== 'travel_types' && self::same($settings[$key] ?? null, $default)) {
                $settings[$key] = null;
            }
        }

        foreach ($defaults['travel_types'] as $partner => $default) {
            if (($settings['travel_types'][$partner] ?? null) === $default) {
                $settings['travel_types'][$partner] = $partner === 'travelmax' ? [] : null;
            }
        }

        return $settings;
    }

    /** The travel insurance the bookings charge per person and day, read once per request. */
    private static function insuranceDailyFee(): int
    {
        return once(fn (): int => (int) round(BookingInsuranceSettings::load()->travelInsuranceDailyFee));
    }

    /** "Hotel***" → "Hotel": the feeds give the stars apart. */
    private static function accommodationType(?string $accommodation): ?string
    {
        return self::text(preg_replace('~\*[*/]*~', '', (string) $accommodation));
    }

    private static function accommodationStop(Tour $tour): ?string
    {
        foreach ($tour->route_stops ?? [] as $stop) {
            if (($stop['accommodation'] ?? false) && ($name = self::text($stop['name'] ?? null)) !== null) {
                return $name;
            }
        }

        return null;
    }

    private static function firstCountryName(Tour $tour): ?string
    {
        $country = TourLabelResolver::referenceOptionItems('country', $tour->country_ids ?? [])[0] ?? null;

        return self::text($country['label'] ?? null);
    }

    /** Equal as the office sees them: rich text by its words, the rest as is. */
    private static function same(mixed $value, mixed $default): bool
    {
        if (is_string($value) && is_string($default)) {
            return self::words($value) === self::words($default);
        }

        return $value === $default;
    }

    private static function words(string $text): string
    {
        return trim((string) preg_replace('~\s+~u', ' ', html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5)));
    }

    private static function text(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? $value : null;
    }
}
