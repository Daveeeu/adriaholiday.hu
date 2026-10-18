<?php

namespace App\Http\Requests\Admin\Tour\Concerns;

/**
 * Tour fields an admin form may leave out — whether the offer lists show
 * the tour, the stay (accommodation and
 * meals, also per date), the text under the program and the tour's own SEO
 * title, description and robots, the partner XML settings (also per
 * date) — shared by the tour store and update
 * requests. A field is taken only when sent, so a save without it keeps
 * the stored (e.g. imported) value.
 */
trait ValidatesOptionalTourContent
{
    /** Request field => camelCase alias the admin form sends. */
    private const OPTIONAL_TOUR_FIELDS = [
        'catering' => 'catering',
        'catering_info' => 'cateringInfo',
        'accommodation' => 'accommodation',
        'accommodation_info' => 'accommodationInfo',
        'program_footer' => 'programFooter',
        'seo_title' => 'seoTitle',
        'seo_description' => 'seoDescription',
        'seo_robots' => 'seoRobots',
        'partner_xml' => 'partnerXml',
    ];

    private const OPTIONAL_DATE_FIELDS = [
        'accommodation' => 'accommodation',
        'accommodation_info' => 'accommodationInfo',
        'catering' => 'catering',
        'catering_info' => 'cateringInfo',
    ];

    protected function mergeOptionalTourContent(): void
    {
        foreach (self::OPTIONAL_TOUR_FIELDS as $field => $alias) {
            if ($this->exists($alias) && ! $this->exists($field)) {
                $this->merge([$field => $this->input($alias)]);
            }
        }
    }

    /**
     * The date's own accommodation and meals that were sent; an empty value
     * means the tour's.
     *
     * @param  array<string, mixed>  $date
     * @return array<string, string|null>
     */
    protected function optionalDateContent(array $date): array
    {
        $content = [];

        foreach (self::OPTIONAL_DATE_FIELDS as $field => $alias) {
            if (array_key_exists($field, $date) || array_key_exists($alias, $date)) {
                $value = trim((string) ($date[$field] ?? $date[$alias] ?? ''));
                $content[$field] = $value !== '' ? $value : null;
            }
        }

        // Whether the partner feeds list the date and its Cesys accommodation.
        if (array_key_exists('xml_enabled', $date) || array_key_exists('xmlEnabled', $date)) {
            $content['xml_enabled'] = filter_var($date['xml_enabled'] ?? $date['xmlEnabled'], FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true;
        }

        if (is_array($partnerXml = $date['partner_xml'] ?? $date['partnerXml'] ?? null)) {
            $cesys = [
                'cesys_accommodation' => trim((string) ($partnerXml['cesys_accommodation'] ?? $partnerXml['cesysAccommodation'] ?? '')) ?: null,
                'cesys_room' => trim((string) ($partnerXml['cesys_room'] ?? $partnerXml['cesysRoom'] ?? '')) ?: null,
            ];
            $content['partner_xml'] = array_filter($cesys) !== [] ? $cesys : null;
        }

        return $content;
    }

    /**
     * @return array<string, array<int, string>>
     */
    protected function optionalTourContentRules(): array
    {
        return [
            'listed' => ['boolean'],
            'catering' => ['nullable', 'string', 'max:255'],
            'catering_info' => ['nullable', 'string', 'max:2000'],
            'accommodation' => ['nullable', 'string', 'max:255'],
            'accommodation_info' => ['nullable', 'string', 'max:2000'],
            'program_footer' => ['nullable', 'string'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:1000'],
            'seo_robots' => ['nullable', 'string', 'max:64', 'regex:/^[a-z\-]+(\s*,\s*[a-z\-]+)*$/i'],
            'dates.*.accommodation' => ['nullable', 'string', 'max:255'],
            'dates.*.accommodation_info' => ['nullable', 'string', 'max:2000'],
            'dates.*.catering' => ['nullable', 'string', 'max:255'],
            'dates.*.catering_info' => ['nullable', 'string', 'max:2000'],
            'dates.*.xml_enabled' => ['boolean'],
            'dates.*.partner_xml' => ['nullable', 'array'],
            'dates.*.partner_xml.cesys_accommodation' => ['nullable', 'string', 'max:255'],
            'dates.*.partner_xml.cesys_room' => ['nullable', 'string', 'max:255'],
            'partner_xml' => ['nullable', 'array'],
            'partner_xml.country_id' => ['nullable', 'integer', 'min:1'],
            'partner_xml.country_name' => ['nullable', 'string', 'max:255'],
            'partner_xml.accommodation_name' => ['nullable', 'string', 'max:255'],
            'partner_xml.city' => ['nullable', 'string', 'max:255'],
            'partner_xml.insurance_value' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'partner_xml.accommodation_description_travelmax' => ['nullable', 'string'],
            'partner_xml.travel_types' => ['nullable', 'array'],
            'partner_xml.travel_types.general' => ['nullable', 'integer'],
            'partner_xml.travel_types.travelgate' => ['nullable', 'integer'],
            'partner_xml.travel_types.cesys' => ['nullable', 'integer'],
            'partner_xml.travel_types.travelmax' => ['nullable', 'array'],
            'partner_xml.travel_types.travelmax.*' => ['integer'],
        ];
    }
}
