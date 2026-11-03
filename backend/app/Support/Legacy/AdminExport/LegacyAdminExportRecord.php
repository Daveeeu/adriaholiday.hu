<?php

namespace App\Support\Legacy\AdminExport;

use Carbon\CarbonImmutable;

/**
 * One record of the legacy admin export, as the browser export wrote it:
 *  - list: the columns of the admin list view, keyed by their header;
 *  - fields: the edit form's inputs ("seo[title]" nested to ["seo"]["title"]);
 *  - selected: select values the legacy admin sets with JavaScript (relations);
 *  - view: labelled values of read-only forms (e.g. a contact message);
 *  - images / gallery_images: file paths relative to the legacy site.
 */
final readonly class LegacyAdminExportRecord
{
    /**
     * @param  array<string, mixed>  $raw
     */
    public function __construct(public array $raw) {}

    public function legacyId(): ?int
    {
        $id = $this->raw['legacy_id'] ?? null;

        return is_numeric($id) && (int) $id > 0 ? (int) $id : null;
    }

    public function listValue(string $column): ?string
    {
        return self::text($this->raw['list'][$column] ?? null);
    }

    /**
     * A form field by dotted path ("seo.title", "name.hu"); select fields
     * answer their value.
     */
    public function field(string $path): ?string
    {
        $value = data_get($this->raw['fields'] ?? [], $path);

        if (is_array($value) && array_key_exists('value', $value)) {
            $value = $value['value'];
        }

        return self::text($value);
    }

    /**
     * @return array<int|string, mixed>
     */
    public function fieldArray(string $path): array
    {
        $value = data_get($this->raw['fields'] ?? [], $path);

        return is_array($value) ? $value : [];
    }

    /**
     * The keys of a checkbox group ("services[3]" ticked → [3]).
     *
     * @return array<int, int>
     */
    public function checkedIds(string $path): array
    {
        return collect($this->fieldArray($path))
            ->filter(fn (mixed $value): bool => $value !== null && $value !== '' && $value !== '0')
            ->keys()
            ->filter(fn (int|string $key): bool => is_numeric($key))
            ->map(fn (int|string $key): int => (int) $key)
            ->values()
            ->all();
    }

    /**
     * A select value the legacy admin sets with JavaScript, falling back to
     * the form field (empty selects are unset).
     */
    public function selected(string $name): ?string
    {
        $value = $this->raw['selected'][$name] ?? null;

        if (is_array($value)) {
            $value = $value[0] ?? null;
        }

        return self::text($value) ?? $this->field($name);
    }

    public function selectedId(string $name): ?int
    {
        $value = $this->selected($name);

        return is_numeric($value) && (int) $value > 0 ? (int) $value : null;
    }

    public function view(string $label): ?string
    {
        return self::text($this->raw['view'][$label] ?? null);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function galleryImages(): array
    {
        return array_values(array_filter($this->raw['gallery_images'] ?? [], 'is_array'));
    }

    /**
     * The record without what changes on every export of the same data
     * (list positions), for change detection.
     *
     * @return array<string, mixed>
     */
    public function payload(): array
    {
        $payload = $this->raw;
        unset($payload['list']['col_0']);

        return $payload;
    }

    /**
     * A legacy date ("2018-09-14 00:00:00", "2018-09-14"); none for empty and
     * zero dates.
     */
    public static function dateTime(?string $value): ?CarbonImmutable
    {
        $value = trim((string) $value);

        if (! preg_match('/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/', $value, $match) || $match[1] === '0000') {
            return null;
        }

        return CarbonImmutable::create((int) $match[1], (int) $match[2], (int) $match[3], (int) ($match[4] ?? 0), (int) ($match[5] ?? 0), (int) ($match[6] ?? 0));
    }

    /**
     * A legacy amount ("8 001 Ft", "84900", "-1 200 Ft") as a number.
     */
    public static function amount(?string $value): ?float
    {
        $digits = (string) preg_replace('/[^\d,.\-]/', '', str_replace(',', '.', (string) $value));

        return is_numeric($digits) ? (float) $digits : null;
    }

    public static function text(mixed $value): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $text = trim((string) $value);

        return $text === '' ? null : $text;
    }
}
