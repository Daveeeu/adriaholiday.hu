<?php

namespace App\Http\Requests\Admin\Tour\Concerns;

/**
 * Tour fields an admin form may leave out — the stay (accommodation and
 * meals, also per date), the text under the program and the tour's own SEO
 * title, description and robots — shared by the tour store and update
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

        return $content;
    }

    /**
     * @return array<string, array<int, string>>
     */
    protected function optionalTourContentRules(): array
    {
        return [
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
        ];
    }
}
