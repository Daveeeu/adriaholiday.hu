<?php

namespace App\Support\PartnerXml;

/**
 * The partner XML settings the legacy admin kept on an offer (its "xml[...]"
 * form fields and its regions) and on a date (whether it was in the XML and
 * its Cesys accommodation), as the new site stores them.
 */
final class LegacyPartnerXmlSettings
{
    /**
     * @param  array<string, mixed>  $extraFields  the legacy offer form's other fields (xml[...])
     * @param  list<string>  $regions  the offer's legacy region names, in order
     * @return array<string, mixed> see PartnerXmlSettings::normalize()
     */
    public static function forTour(array $extraFields, array $regions): array
    {
        $country = collect($regions)->first(fn (mixed $name): bool => is_string($name) && PartnerXmlSettings::legacyRegionId($name) !== null);

        return PartnerXmlSettings::normalize([
            'country_id' => PartnerXmlSettings::legacyRegionId($country),
            'country_name' => $country,
            'accommodation_name' => $extraFields['xml[accommodation_name]'] ?? null,
            'city' => $extraFields['xml[city]'] ?? null,
            'insurance_value' => $extraFields['xml[insurance_value]'] ?? null,
            'accommodation_description_travelmax' => $extraFields['xml[accommodation_description_travelmax]'] ?? null,
            'travel_types' => [
                'general' => self::selected($extraFields['xml[travel_type]'] ?? null),
                'travelgate' => self::selected($extraFields['xml[travel_type_travelgate]'] ?? null),
                'cesys' => self::selected($extraFields['xml[travel_type_cesys]'] ?? null),
                'travelmax' => collect(is_array($extraFields['xml[travel_type_travelmax][]'] ?? null) ? $extraFields['xml[travel_type_travelmax][]'] : [])
                    ->map(fn (mixed $option): mixed => is_array($option) ? ($option['key'] ?? null) : $option)
                    ->all(),
            ],
        ]);
    }

    /**
     * @param  array<string, mixed>  $legacyAttributes  of a date (see LegacyCatalogOfferMapper)
     * @return array{xml_enabled: bool, partner_xml: array{cesys_accommodation: string|null, cesys_room: string|null}|null}
     */
    public static function forDate(array $legacyAttributes): array
    {
        $cesys = [
            'cesys_accommodation' => self::text($legacyAttributes['accommodation_cesys'] ?? null),
            'cesys_room' => self::text($legacyAttributes['accommodation_info_cesys'] ?? null),
        ];

        return [
            'xml_enabled' => (bool) ($legacyAttributes['xml_enabled'] ?? true),
            'partner_xml' => array_filter($cesys) !== [] ? $cesys : null,
        ];
    }

    private static function selected(mixed $field): mixed
    {
        return is_array($field) ? ($field['value'] ?? null) : $field;
    }

    private static function text(mixed $value): ?string
    {
        $value = is_string($value) ? trim(strip_tags($value)) : '';

        return $value !== '' ? $value : null;
    }
}
