<?php

namespace App\Services\Booking;

use App\Models\BookingFormField;
use App\Models\BookingFormTemplate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Manages the catalog of booking form fields that templates can use.
 * Field keys are generated once and never change, because submitted
 * bookings store their values keyed by them.
 */
class BookingFormFieldService
{
    /**
     * @param  array{label: string, description?: string|null, price_label?: string|null, field_type: string, input_group: string, options?: array<int, string>|null}  $data
     */
    public function create(array $data): BookingFormField
    {
        return BookingFormField::create([
            'key' => $this->generateUniqueKey($data['input_group'], $data['label']),
            'label' => $data['label'],
            'description' => $data['description'] ?? null,
            'price_label' => $data['price_label'] ?? null,
            'field_type' => $data['field_type'],
            'input_group' => $data['input_group'],
            'options' => $this->normalizeOptions($data['field_type'], $data['options'] ?? null),
            'sort_order' => (int) BookingFormField::query()->max('sort_order') + 1,
        ]);
    }

    /**
     * @param  array{label: string, description?: string|null, price_label?: string|null, field_type: string, input_group: string, options?: array<int, string>|null}  $data
     */
    public function update(BookingFormField $field, array $data): BookingFormField
    {
        if ($field->isSystem() && ($data['field_type'] !== $field->field_type || $data['input_group'] !== $field->input_group)) {
            throw ValidationException::withMessages([
                'field_type' => 'Rendszermező típusa és csoportja nem módosítható.',
            ]);
        }

        $field->update([
            'label' => $data['label'],
            'description' => $data['description'] ?? null,
            'price_label' => $data['price_label'] ?? null,
            'field_type' => $data['field_type'],
            'input_group' => $data['input_group'],
            'options' => $this->normalizeOptions($data['field_type'], $data['options'] ?? null),
        ]);

        return $field;
    }

    public function delete(BookingFormField $field): void
    {
        if ($field->isSystem()) {
            throw ValidationException::withMessages([
                'field' => 'Rendszermező nem törölhető.',
            ]);
        }

        $templateNames = BookingFormTemplate::query()
            ->whereHas('templateFields', fn ($query) => $query
                ->where('booking_form_field_id', $field->id)
                ->where('visibility', '!=', 'hidden'))
            ->orderBy('name')
            ->pluck('name');

        if ($templateNames->isNotEmpty()) {
            throw ValidationException::withMessages([
                'field' => 'A mezőt az alábbi sablonok használják: '.$templateNames->implode(', ').'. Előbb állítsd rejtettre bennük.',
            ]);
        }

        $field->delete();
    }

    private function generateUniqueKey(string $inputGroup, string $label): string
    {
        $slug = Str::slug(Str::ascii($label), '_');
        $base = $inputGroup.'_'.($slug !== '' ? $slug : 'field');
        $key = $base;
        $suffix = 2;

        while (BookingFormField::query()->where('key', $key)->exists()) {
            $key = "{$base}_{$suffix}";
            $suffix++;
        }

        return $key;
    }

    /**
     * @param  array<int, string>|null  $options
     * @return array<int, string>|null
     */
    private function normalizeOptions(string $fieldType, ?array $options): ?array
    {
        if (! BookingFormField::usesOptions($fieldType)) {
            return null;
        }

        return collect($options ?? [])
            ->map(fn ($option): string => trim((string) $option))
            ->filter(fn (string $option): bool => $option !== '')
            ->unique()
            ->values()
            ->all();
    }
}
