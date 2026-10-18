<?php

namespace App\Support\PartnerXml;

/**
 * A tour's settings for the partner XML feeds (tours.partner_xml): the
 * region the partners file it under, the travel type each partner knows,
 * and what the legacy admin's "XML" fields held — the accommodation shown
 * to the portals, the city, the insurance fee per day and Travelmax's
 * accommodation description.
 */
final class PartnerXmlSettings
{
    public const TRAVEL_TYPE_KEYS = ['general', 'travelgate', 'cesys'];

    /**
     * The stored settings in their full shape, unknown values dropped.
     *
     * @param  array<string, mixed>|null  $settings
     * @return array{country_id: int|null, country_name: string|null, accommodation_name: string|null, city: string|null, insurance_value: int|null, accommodation_description_travelmax: string|null, travel_types: array{general: int|null, travelgate: int|null, cesys: int|null, travelmax: list<int>}}
     */
    public static function normalize(?array $settings): array
    {
        $settings ??= [];
        $types = is_array($settings['travel_types'] ?? null) ? $settings['travel_types'] : [];
        $travelTypes = [];

        foreach (self::TRAVEL_TYPE_KEYS as $key) {
            $travelTypes[$key] = self::knownTravelType($key, $types[$key] ?? null);
        }

        $travelTypes['travelmax'] = array_values(array_unique(array_filter(
            array_map(fn (mixed $value): ?int => self::knownTravelType('travelmax', $value), is_array($types['travelmax'] ?? null) ? $types['travelmax'] : []),
        )));

        return [
            'country_id' => self::positiveInt($settings['country_id'] ?? null),
            'country_name' => self::text($settings['country_name'] ?? null),
            'accommodation_name' => self::text($settings['accommodation_name'] ?? null),
            'city' => self::text($settings['city'] ?? null),
            'insurance_value' => is_numeric($settings['insurance_value'] ?? null) ? max(0, (int) $settings['insurance_value']) : null,
            'accommodation_description_travelmax' => self::text($settings['accommodation_description_travelmax'] ?? null),
            'travel_types' => $travelTypes,
        ];
    }

    /**
     * The label of a partner's travel type ("" when none).
     */
    public static function travelTypeLabel(string $partner, ?int $value): string
    {
        return $value !== null ? (string) (config("partner_xml.travel_types.{$partner}.{$value}") ?? '') : '';
    }

    /**
     * The legacy region id of a region name, if the legacy site had it.
     */
    public static function legacyRegionId(?string $name): ?int
    {
        $id = $name !== null ? config('partner_xml.legacy_regions')[$name] ?? null : null;

        return is_int($id) ? $id : null;
    }

    private static function knownTravelType(string $partner, mixed $value): ?int
    {
        $value = self::positiveInt($value);

        return $value !== null && config("partner_xml.travel_types.{$partner}.{$value}") !== null ? $value : null;
    }

    private static function positiveInt(mixed $value): ?int
    {
        return is_numeric($value) && (int) $value > 0 ? (int) $value : null;
    }

    private static function text(mixed $value): ?string
    {
        $value = is_string($value) ? trim($value) : '';

        return $value !== '' ? $value : null;
    }
}
